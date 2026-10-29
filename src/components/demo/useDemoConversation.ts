"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/data/brand";
import { getDemoProject } from "@/data/projects";
import { useChat } from "@/hooks/useChat";
import { WELCOME_DELAY_MS } from "./config";
import type { Channel, ChatItem, QuotedMessage } from "@/types/simulator";

type FlowKind = "concierge" | "callback";
type FlowStep = "name" | "business" | "phone";

interface Flow {
  kind: FlowKind;
  step: FlowStep;
  data: { name?: string; business?: string };
}

const OFFER_ID = "reazix-offer";
const ts = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * The /demo conversation: the shared AI chat (useChat → /api/chat, same tools,
 * limits and offline fallback) plus demo-only behaviour:
 * - ?q= is sent as the first message once, ?project= picks the knowledge base
 * - the chat survives a refresh (sessionStorage)
 * - after key details or a booked visit, a native interactive offer to talk to Reazix
 * - in-chat lead flows (name → business → phone) posted to /api/lead
 */
export interface DemoParams {
  q?: string;
  project?: string;
}

/** Read ?q= and ?project= (client only; the pages stay static for fast loads). */
export function readDemoParams(): DemoParams {
  const sp = new URLSearchParams(window.location.search);
  return { q: sp.get("q")?.slice(0, 500) || undefined, project: sp.get("project") || undefined };
}

export function useDemoConversation(channel: Channel, params: DemoParams) {
  const reducedMotion = useReducedMotion() ?? false;
  const project = getDemoProject(params.project);
  const chat = useChat({
    reducedMotion,
    project: project.id,
    welcome: project.welcome,
    starters: project.starters,
    welcomeDelayMs: WELCOME_DELAY_MS,
    splitLongReplies: true,
    persistKey: `reazix-demo:${channel}:${project.id}`,
  });

  const [flow, setFlow] = useState<Flow | null>(null);
  const flowRef = useRef(flow);
  flowRef.current = flow;

  // ?q= : send once, after the greeting, unless this session already has messages.
  const qSent = useRef(false);
  useEffect(() => {
    if (!params.q || qSent.current || !chat.ready || chat.isBusy) return;
    qSent.current = true;
    if (chat.userMessageCount === 0) void chat.send(params.q);
    // Don't resend on refresh.
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [params.q, chat]);

  // Offer an AI concierge for their own business once they've shared key details or booked a visit.
  const offerShown = chat.items.some((i) => i.id.startsWith(OFFER_ID));
  const capturedFields = ["name", "configuration", "budget", "timeline", "purpose", "visitSlot"].filter(
    (k) => chat.lead[k as keyof typeof chat.lead],
  ).length;
  const qualifies = Boolean(chat.lead.visitSlot) || capturedFields >= 2;
  useEffect(() => {
    if (offerShown || !qualifies || chat.isBusy || flowRef.current || chat.userMessageCount < 2) return;
    const t = window.setTimeout(() => {
      void chat.botSay([
        {
          id: `${OFFER_ID}-${Date.now()}`,
          kind: "interactive",
          text: "Want an AI concierge like this for your business? ✨\nReazix builds and runs them for real estate teams.",
          buttons: [
            { id: "talk", label: "Talk to Reazix" },
            { id: "keep", label: "Keep chatting" },
          ],
          timestamp: ts(),
        },
      ]);
    }, 1200);
    return () => clearTimeout(t);
  }, [offerShown, qualifies, chat]);

  const startFlow = useCallback(
    async (kind: FlowKind) => {
      setFlow({ kind, step: "name", data: {} });
      await chat.botSay(
        kind === "concierge"
          ? ["Great! A Reazix specialist can show you what we'd build for your projects.", "First, what's your name?"]
          : ["Sure, a Reazix specialist can call you back.", "What's your name?"],
      );
    },
    [chat],
  );

  const submitLead = useCallback(
    async (f: Flow, phone: string) => {
      setFlow(null);
      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "demo-chat",
            intent: f.kind,
            name: f.data.name,
            business: f.data.business,
            phone,
            channel,
            project: project.id,
          }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (!res.ok || !json.ok) throw new Error(json.error);
        await chat.botSay([
          `Thanks, ${f.data.name?.split(" ")[0]}! A Reazix specialist will reach out within one business day. 🙌`,
          {
            id: `cta-${Date.now()}`,
            kind: "cta",
            text: "Prefer to talk now? Call us for a free strategy call.",
            label: `Call ${brand.contact.phoneDisplay}`,
            url: brand.contact.phoneHref,
            timestamp: ts(),
          },
        ]);
      } catch {
        await chat.botSay(["Sorry, that didn't go through. Please try again in a moment."]);
      }
    },
    [chat, channel, project.id],
  );

  /** Everything the visitor types or taps goes through here. */
  const onSend = useCallback(
    async (text: string, quote?: QuotedMessage) => {
      const f = flowRef.current;
      if (!f) {
        void chat.send(text, { quote });
        return;
      }
      if (chat.isBusy) return;
      chat.userSay(text, quote);
      if (f.step === "name") {
        if (text.trim().length < 2) return void chat.botSay(["Could you share your name?"]);
        setFlow({ ...f, step: "business", data: { ...f.data, name: text.trim() } });
        await chat.botSay([`Nice to meet you, ${text.trim().split(" ")[0]}. What's your business or company called?`]);
      } else if (f.step === "business") {
        if (text.trim().length < 2) return void chat.botSay(["What's your business called?"]);
        setFlow({ ...f, step: "phone", data: { ...f.data, business: text.trim() } });
        await chat.botSay(["And the best phone number to reach you, with country code? (e.g. +91 98…)"]);
      } else if (!/^\+?[0-9 ()-]{7,18}$/.test(text.trim())) {
        await chat.botSay(["That doesn't look like a phone number. Could you send it with the country code?"]);
      } else {
        await submitLead(f, text.trim());
      }
    },
    [chat, submitLead],
  );

  /** Native reply-button taps (interactive messages). */
  const onInteractive = useCallback(
    async (item: Extract<ChatItem, { kind: "interactive" }>, buttonId: string) => {
      if (item.selectedId || chat.isBusy) return;
      const button = item.buttons.find((b) => b.id === buttonId);
      if (!button) return;
      chat.updateItem(item.id, (m) => (m.kind === "interactive" ? { ...m, selectedId: buttonId } : m));
      chat.userSay(button.label);
      if (item.id.startsWith(OFFER_ID) && buttonId === "talk") await startFlow("concierge");
      else if (item.id.startsWith(OFFER_ID)) await chat.botSay([`Of course! Ask me anything about ${project.name}. 😊`]);
    },
    [chat, startFlow, project.name],
  );

  const requestCallback = useCallback(async () => {
    if (flowRef.current || chat.isBusy) return;
    chat.userSay("I'd like a callback from a Reazix specialist");
    await startFlow("callback");
  }, [chat, startFlow]);

  const restart = useCallback(() => {
    setFlow(null);
    chat.restart();
  }, [chat]);

  return { chat, project, flow, onSend, onInteractive, requestCallback, restart, clear: chat.clear };
}
