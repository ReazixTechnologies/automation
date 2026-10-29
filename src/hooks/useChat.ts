"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_LIMITS } from "@/lib/ai/config";
import { track } from "@/lib/analytics";
import { LIVE_DEMO_PREFILL_EVENT, type LiveDemoPrefill } from "@/lib/liveDemo";
import { starterSuggestions, welcomeMessage } from "@/data/projectKnowledge";
import type { MessageStatus } from "@/types/chat";
import type { ChatItem, ChatStreamEvent, FeedEntry, HistoryMessage, LeadState, QuotedMessage } from "@/types/simulator";

const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fieldLabels: Record<string, string> = {
  name: "Name",
  configuration: "Configuration",
  budget: "Budget",
  timeline: "Timeline",
  purpose: "Purpose",
  visitSlot: "Visit slot",
};

/** Plain-text history for the server; rich cards become short notes the model can read. */
function toHistory(items: ChatItem[]): HistoryMessage[] {
  const out: HistoryMessage[] = [];
  const push = (role: HistoryMessage["role"], content: string) => {
    const prev = out[out.length - 1];
    if (prev?.role === role) prev.content = `${prev.content}\n${content}`;
    else out.push({ role, content });
  };
  for (const item of items) {
    if (item.local) continue;
    switch (item.kind) {
      case "text":
        if (item.text) push(item.role, item.quote ? `(replying to "${item.quote.text.slice(0, 80)}") ${item.text}` : item.text);
        break;
      case "units":
        push("assistant", `[Showed unit cards: ${item.units.map((u) => u.label).join(", ")}]`);
        break;
      case "pdf":
        push("assistant", `[Sent floor plan PDF: ${item.configuration}]`);
        break;
      case "slots":
        push("assistant", `[Offered visit slots: ${item.slots.map((s) => s.label).join(" | ")}]`);
        break;
      case "location":
        push("assistant", "[Shared Experience Centre location]");
        break;
      case "handoff":
        push("assistant", `[Human advisor ${item.agent} joined and said: ${item.reply}]`);
        break;
    }
  }
  return out.map((m) => ({ ...m, content: m.content.slice(-CHAT_LIMITS.maxAssistantChars) }));
}

/** Where a long reply can be split: the last sentence end after `min` characters. */
function sentenceCut(text: string, min = 90) {
  let cut = -1;
  const re = /[.!?…](?=\s)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) if (m.index >= min && m.index < text.length - 2) cut = m.index;
  return cut;
}

/** Split a finished reply into at most `max` texting-sized bubbles. */
function splitReply(text: string, max = 3) {
  const parts: string[] = [];
  let rest = text.trim();
  while (parts.length < max - 1 && rest.length > 160) {
    const cut = sentenceCut(rest);
    if (cut < 0) break;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  parts.push(rest);
  return parts.filter(Boolean);
}

interface PersistedChat {
  v: 1;
  items: ChatItem[];
  suggestions: string[];
  lead: LeadState;
}

function loadPersisted(key?: string): PersistedChat | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedChat;
    if (data?.v !== 1 || !Array.isArray(data.items)) return null;
    // Anything that was mid-stream when the page closed is shown as finished.
    data.items = data.items.map((i) => (i.kind === "text" ? { ...i, streaming: false } : i));
    return data;
  } catch {
    return null;
  }
}

function savePersisted(key: string | undefined, data: PersistedChat | null) {
  if (!key) return;
  try {
    if (data) sessionStorage.setItem(key, JSON.stringify(data));
    else sessionStorage.removeItem(key);
  } catch {
    /* storage unavailable: the chat simply won't survive a refresh */
  }
}

interface UseChatOptions {
  /** Buffer each text segment and show it whole instead of token by token. */
  reducedMotion?: boolean;
  /** sessionStorage key; when set the conversation survives a refresh. */
  persistKey?: string;
  /** Demo project id sent to /api/chat (selects the knowledge base). */
  project?: string;
  welcome?: string;
  starters?: string[];
  /** Show "typing…" this long before the greeting appears (0 = immediately). */
  welcomeDelayMs?: number;
  /** Split long streamed replies into up to 3 bubbles at sentence ends, like a person texting. */
  splitLongReplies?: boolean;
}

export function useChat({
  reducedMotion = false,
  persistKey,
  project,
  welcome = welcomeMessage,
  starters = starterSuggestions,
  welcomeDelayMs = 0,
  splitLongReplies = false,
}: UseChatOptions = {}) {
  // Welcome is added after mount so its timestamp never mismatches SSR.
  const [items, setItems] = useState<ChatItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(starters);
  const [lead, setLead] = useState<LeadState>({ score: 0 });
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "offline" | null>(null);
  const [prefill, setPrefill] = useState<LiveDemoPrefill | null>(null);
  const [ready, setReady] = useState(false);

  // Other sections can prefill the input via prefillLiveDemo().
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (text) setPrefill({ text: text.slice(0, CHAT_LIMITS.maxMessageChars), id: Date.now() });
    };
    window.addEventListener(LIVE_DEMO_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(LIVE_DEMO_PREFILL_EVENT, onPrefill);
  }, []);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const leadRef = useRef(lead);
  leadRef.current = lead;
  const modeRef = useRef(mode);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;
  const welcomeTimer = useRef<number | null>(null);
  const opts = useRef({ welcome, starters, welcomeDelayMs, persistKey });
  opts.current = { welcome, starters, welcomeDelayMs, persistKey };

  const greet = useCallback(() => {
    const { welcome: text, welcomeDelayMs: delay } = opts.current;
    const item: ChatItem = { id: uid("welcome"), kind: "text", role: "assistant", text, timestamp: timeNow() };
    if (welcomeTimer.current) clearTimeout(welcomeTimer.current);
    if (!delay || reducedRef.current) {
      setItems([item]);
      setReady(true);
      return;
    }
    setItems([]);
    setIsTyping(true);
    welcomeTimer.current = window.setTimeout(() => {
      setItems([{ ...item, timestamp: timeNow() }]);
      setIsTyping(false);
      setReady(true);
    }, delay);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    busyRef.current = false;
    savePersisted(opts.current.persistKey, null);
    setSuggestions(opts.current.starters);
    setLead({ score: 0 });
    setFeed([]);
    setIsTyping(false);
    setIsBusy(false);
    setReady(false);
    greet();
  }, [greet]);

  // First load: restore a saved conversation, otherwise greet.
  useEffect(() => {
    const saved = loadPersisted(opts.current.persistKey);
    if (saved) {
      setItems(saved.items);
      setSuggestions(saved.suggestions);
      setLead(saved.lead);
      setReady(true);
    } else {
      reset();
    }
    return () => {
      abortRef.current?.abort();
      if (welcomeTimer.current) clearTimeout(welcomeTimer.current);
    };
  }, [reset]);

  // Persist settled conversations (not mid-stream).
  useEffect(() => {
    if (!persistKey || isBusy || !ready) return;
    savePersisted(persistKey, { v: 1, items, suggestions, lead });
  }, [persistKey, isBusy, ready, items, suggestions, lead]);

  const log = useCallback((text: string, tone: FeedEntry["tone"]) => {
    setFeed((f) => [{ id: uid("feed"), text, tone, at: timeNow() }, ...f].slice(0, 30));
  }, []);

  const notice = useCallback((text: string) => setItems((list) => [...list, { id: uid("notice"), kind: "notice", text }]), []);

  const setStatus = (id: string, status: MessageStatus) =>
    setItems((list) => list.map((m) => (m.id === id && m.kind === "text" ? { ...m, status } : m)));

  const send = useCallback(
    async (raw: string, sendOpts: { quote?: QuotedMessage } = {}) => {
      const text = raw.trim();
      if (!text || busyRef.current) return;
      if (text.length > CHAT_LIMITS.maxMessageChars) {
        notice(`Messages are limited to ${CHAT_LIMITS.maxMessageChars} characters in this demo.`);
        return;
      }
      const userCount = itemsRef.current.filter((m) => m.kind === "text" && m.role === "user" && !m.local).length;
      if (userCount >= CHAT_LIMITS.maxUserMessages) {
        notice("You've reached the demo's message limit. Restart the demo to begin a new conversation. 🙏");
        return;
      }

      const userItem: ChatItem = { id: uid("u"), kind: "text", role: "user", text, timestamp: timeNow(), status: "sent", quote: sendOpts.quote };
      const history = toHistory([...itemsRef.current, userItem]);
      setItems((list) => [...list, userItem]);
      setSuggestions([]);
      setPrefill(null);
      track("demo_message_sent", { length: text.length });
      setIsTyping(true);
      setIsBusy(true);
      busyRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;
      const startedAt = performance.now();
      let replied = false;
      let pendingSuggestions: string[] = [];
      // The assistant text bubble currently receiving tokens.
      let segment: { id: string; text: string; parts: number } | null = null;

      const flushSegment = () => {
        if (!segment) return;
        const { id, text: segText } = segment;
        if (reducedRef.current) {
          const parts = splitLongReplies ? splitReply(segText) : [segText];
          setItems((list) => [...list, ...parts.map((t, i) => ({ id: i ? uid("a") : id, kind: "text" as const, role: "assistant" as const, text: t, timestamp: timeNow() }))]);
        } else {
          setItems((list) => list.map((m) => (m.id === id && m.kind === "text" ? { ...m, text: segText, streaming: false } : m)));
        }
        segment = null;
      };

      const markReplied = () => {
        if (replied) return;
        replied = true;
        setStatus(userItem.id, "read");
        const ms = performance.now() - startedAt;
        log(`AI replied in ${ms < 1000 ? `${Math.max(1, Math.round(ms))} ms` : `${(ms / 1000).toFixed(1)}s`}`, "system");
      };

      const pushRich = (item: ChatItem) => {
        track("demo_tool_shown", { tool: item.kind });
        markReplied();
        flushSegment();
        setItems((list) => [...list, item]);
        setIsTyping(true); // more may follow
      };

      const handle = (event: ChatStreamEvent) => {
        const ts = timeNow();
        switch (event.type) {
          case "meta":
            if (event.mode === "offline" && modeRef.current !== "offline") {
              log("Offline demo mode: answering from the FAQ knowledge base", "system");
            }
            modeRef.current = event.mode;
            setMode(event.mode);
            break;
          case "text": {
            markReplied();
            if (!segment) {
              segment = { id: uid("a"), text: "", parts: 1 };
              if (!reducedRef.current) {
                const id = segment.id;
                setItems((list) => [...list, { id, kind: "text", role: "assistant", text: "", timestamp: ts, streaming: true }]);
              }
            }
            segment.text += event.delta;
            if (!reducedRef.current) {
              // Texting style: once a bubble is long, continue in a new one at the next sentence end.
              if (splitLongReplies && segment.parts < 3 && segment.text.length > 160) {
                const cut = sentenceCut(segment.text);
                if (cut > 0) {
                  const head = segment.text.slice(0, cut + 1).trim();
                  const rest = segment.text.slice(cut + 1).trimStart();
                  const doneId = segment.id;
                  const nextId = uid("a");
                  setItems((list) => [
                    ...list.map((m) => (m.id === doneId && m.kind === "text" ? { ...m, text: head, streaming: false } : m)),
                    { id: nextId, kind: "text", role: "assistant", text: rest, timestamp: ts, streaming: true },
                  ]);
                  segment = { id: nextId, text: rest, parts: segment.parts + 1 };
                  break;
                }
              }
              const { id, text: segText } = segment;
              setIsTyping(false);
              setItems((list) => list.map((m) => (m.id === id && m.kind === "text" ? { ...m, text: segText } : m)));
            }
            break;
          }
          case "units":
            pushRich({ id: uid("units"), kind: "units", units: event.units, timestamp: ts });
            log(`Intent detected: pricing · ${event.units.map((u) => u.label).join(", ")} cards sent`, "intent");
            break;
          case "pdf":
            pushRich({ id: uid("pdf"), kind: "pdf", configuration: event.configuration, name: event.name, pages: event.pages, size: event.size, timestamp: ts });
            log(`Floor plan auto-sent (${event.configuration})`, "action");
            break;
          case "slots":
            pushRich({ id: uid("slots"), kind: "slots", slots: event.slots, timestamp: ts });
            log("Intent detected: site visit · live slots offered", "intent");
            break;
          case "location":
            pushRich({ id: uid("loc"), kind: "location", name: event.name, address: event.address, hours: event.hours, timestamp: ts });
            log("Experience Centre location shared", "action");
            break;
          case "handoff":
            pushRich({ id: uid("handoff"), kind: "handoff", agent: event.agent, team: event.team, reply: event.reply, timestamp: ts });
            log(`Human handoff: ${event.reason}`, "action");
            break;
          case "lead": {
            const prev = leadRef.current;
            const next: LeadState = { ...prev };
            for (const [key, value] of Object.entries(event.fields)) {
              if (typeof value === "string" && value && prev[key as keyof LeadState] !== value) {
                (next as unknown as Record<string, string>)[key] = value;
                log(`Captured ${fieldLabels[key] ?? key}: ${value}`, "action");
              }
            }
            if (typeof event.score === "number" && event.score !== prev.score) {
              const diff = event.score - prev.score;
              next.score = event.score;
              log(`Lead score ${diff > 0 ? "+" : ""}${diff} → ${event.score}`, "score");
            }
            leadRef.current = next;
            setLead(next);
            break;
          }
          case "suggestions":
            pendingSuggestions = event.options;
            break;
          case "notice":
            markReplied();
            flushSegment();
            notice(event.text);
            break;
          case "done":
            break;
        }
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, ...(project ? { project } : {}) }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        setStatus(userItem.id, "delivered");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const chunk = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const line = chunk.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            try {
              handle(JSON.parse(line.slice(6)) as ChatStreamEvent);
            } catch {
              /* ignore a malformed event */
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        markReplied();
        notice("Couldn't reach the concierge. Please check your connection and try again.");
        console.warn("chat request failed", err instanceof Error ? err.message : err);
      } finally {
        if (abortRef.current === controller) {
          flushSegment();
          setSuggestions(pendingSuggestions);
          setIsTyping(false);
          setIsBusy(false);
          busyRef.current = false;
        }
      }
    },
    [log, notice, project, splitLongReplies],
  );

  /* ---- Local (browser-only) messages, used by in-chat flows ---------------- */

  /** Append items without calling the model. */
  const pushLocal = useCallback((add: ChatItem | ChatItem[]) => {
    const list = (Array.isArray(add) ? add : [add]).map((i) => ({ ...i, local: true }));
    setItems((prev) => [...prev, ...list]);
  }, []);

  /** Change one item in place (reactions, chosen buttons). */
  const updateItem = useCallback((id: string, patch: (item: ChatItem) => ChatItem) => {
    setItems((list) => list.map((m) => (m.id === id ? patch(m) : m)));
  }, []);

  /** A local user message with realistic ticks (sent → delivered → read). */
  const userSay = useCallback((text: string, quote?: QuotedMessage) => {
    const id = uid("u");
    setItems((list) => [...list, { id, kind: "text", role: "user", text, timestamp: timeNow(), status: "sent", quote, local: true }]);
    window.setTimeout(() => setStatus(id, "delivered"), 350);
    window.setTimeout(() => setStatus(id, "read"), 900);
    return id;
  }, []);

  /** Local bot messages, each after a short typing indicator. */
  const botSay = useCallback(async (messages: (string | ChatItem)[]) => {
    busyRef.current = true;
    setIsBusy(true);
    setSuggestions([]);
    for (const m of messages) {
      setIsTyping(true);
      await wait(reducedRef.current ? 150 : Math.min(1400, 500 + (typeof m === "string" ? m.length * 12 : 300)));
      setIsTyping(false);
      const item: ChatItem =
        typeof m === "string" ? { id: uid("a"), kind: "text", role: "assistant", text: m, timestamp: timeNow(), local: true } : { ...m, local: true };
      setItems((list) => [...list, item]);
    }
    busyRef.current = false;
    setIsBusy(false);
  }, []);

  /** Remove the visible messages (⋮ → Clear chat) but keep the session. */
  const clear = useCallback(() => {
    abortRef.current?.abort();
    busyRef.current = false;
    setIsBusy(false);
    setIsTyping(false);
    setItems([]);
    setSuggestions([]);
  }, []);

  const userMessageCount = items.filter((m) => m.kind === "text" && m.role === "user" && !m.local).length;

  return {
    items,
    suggestions,
    lead,
    feed,
    isTyping,
    isBusy,
    mode,
    prefill,
    ready,
    send,
    restart: reset,
    clear,
    pushLocal,
    updateItem,
    userSay,
    botSay,
    userMessageCount,
  };
}
