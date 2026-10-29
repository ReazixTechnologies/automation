"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type UIEvent } from "react";
import { getDemoProject } from "@/data/projects";
import { cn } from "@/lib/utils";
import type { VisitSlot } from "@/data/projectKnowledge";
import type { Channel, ChatItem, QuotedMessage } from "@/types/simulator";
import { SHOW_POWERED_BY_DESKTOP } from "./config";
import { DemoFrame, VIEWPORT_EVENT } from "./DemoFrame";
import { InstagramView } from "./InstagramView";
import type { DemoViewProps } from "./types";
import { readDemoParams, useDemoConversation, type DemoParams } from "./useDemoConversation";
import { WhatsAppView } from "./WhatsAppView";

// Interaction layers load on first use, keeping the initial bundle small on 4G.
const ReactionBar = dynamic(() => import("./overlays/ReactionBar"), { ssr: false });
const Sheet = dynamic(() => import("./overlays/Sheet"), { ssr: false });
const ImageViewer = dynamic(() => import("./overlays/ImageViewer"), { ssr: false });

const noop = () => {};

/** Plain-text summary of a message, for reply quotes. */
function summarize(item: ChatItem): string {
  switch (item.kind) {
    case "text":
      return item.text;
    case "units":
      return `📷 ${item.units.map((u) => u.label).join(", ")}`;
    case "pdf":
      return `📄 ${item.name}`;
    case "slots":
      return "🗓️ Site visit slots";
    case "location":
      return `📍 ${item.name}`;
    case "handoff":
      return item.reply;
    case "interactive":
    case "cta":
      return item.text;
    default:
      return "";
  }
}

export function DemoChat({ channel }: { channel: Channel }) {
  const [params, setParams] = useState<DemoParams | null>(null);
  useEffect(() => setParams(readDemoParams()), []);

  return (
    <DemoFrame channel={channel}>
      {params ? <LiveConversation channel={channel} params={params} /> : <StaticShell channel={channel} />}
    </DemoFrame>
  );
}

/** Server-rendered chat chrome (header, notices, composer) shown until the conversation mounts. */
function StaticShell({ channel }: { channel: Channel }) {
  const listRef = useRef<HTMLDivElement>(null);
  const props: DemoViewProps = {
    project: getDemoProject(),
    items: [],
    isTyping: false,
    isBusy: true,
    suggestions: [],
    live: false,
    reducedMotion: false,
    listRef,
    onListScroll: noop,
    scrollButton: null,
    poweredBy: <PoweredByLine channel={channel} />,
    quote: null,
    onClearQuote: noop,
    onSend: noop,
    onComposerSend: noop,
    onInteractive: noop,
    onReplyTo: noop,
    onActions: noop,
    onReact: noop,
    onOpenImage: noop,
    onOpenSlots: noop,
    onLocation: noop,
    onHeaderAction: noop,
    menuOpen: false,
    onClearChat: noop,
    onRestart: noop,
  };
  return channel === "whatsapp" ? <WhatsAppView {...props} /> : <InstagramView {...props} />;
}

function PoweredByLine({ channel }: { channel: Channel }) {
  if (!SHOW_POWERED_BY_DESKTOP) return null;
  return (
    <p
      className={cn(
        "hidden shrink-0 pb-2 text-center text-[10px] font-medium uppercase tracking-[0.25em] md:block",
        channel === "whatsapp" ? "bg-[#EFEAE2] text-[#54656F] dark:bg-[#0B141A] dark:text-[#8696A0]" : "bg-white text-[#737373] dark:bg-black dark:text-[#A8A8A8]",
      )}
    >
      Powered by Reazix
    </p>
  );
}

type Overlay =
  | { type: "reactions"; item: ChatItem; anchor: { top: number; bottom: number; left: number; right: number; width: number }; container: { width: number; height: number }; align: "start" | "end" }
  | { type: "slots"; slots: VisitSlot[] }
  | { type: "call" }
  | { type: "image"; title: string; caption?: string; background: string }
  | null;

function LiveConversation({ channel, params }: { channel: Channel; params: DemoParams }) {
  const reducedMotion = useReducedMotion() ?? false;
  const { chat, project, onSend, onInteractive, requestCallback, restart, clear } = useDemoConversation(channel, params);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [unread, setUnread] = useState(0);
  const [quote, setQuote] = useState<QuotedMessage | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chosenSlot, setChosenSlot] = useState<string | null>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
    atBottom.current = true;
    setShowJump(false);
    setUnread(0);
  }, [reducedMotion]);

  // Keep the newest message in view (also while tokens stream); count unread when scrolled up.
  const last = chat.items[chat.items.length - 1];
  const lastLen = last?.kind === "text" ? last.text.length : 0;
  const prevCount = useRef(0);
  useLayoutEffect(() => {
    const added = chat.items.length - prevCount.current;
    prevCount.current = chat.items.length;
    if (atBottom.current || (last?.kind === "text" && last.role === "user")) scrollToBottom();
    else if (added > 0) setUnread((u) => u + added);
  }, [chat.items.length, lastLen, chat.isTyping, last, scrollToBottom]);

  // Keyboard open/close or rotation: stay pinned to the newest message.
  useEffect(() => {
    const onViewport = () => atBottom.current && scrollToBottom();
    window.addEventListener(VIEWPORT_EVENT, onViewport);
    return () => window.removeEventListener(VIEWPORT_EVENT, onViewport);
  }, [scrollToBottom]);

  const onListScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottom.current = near;
    setShowJump(!near);
    if (near) setUnread(0);
  };

  const focusInput = () => document.getElementById(channel === "whatsapp" ? "wa-input" : "ig-input")?.focus();

  const send = (text: string) => {
    atBottom.current = true;
    void onSend(text);
  };
  const composerSend = (text: string) => {
    atBottom.current = true;
    void onSend(text, quote ?? undefined);
    setQuote(null);
  };

  const replyTo = (item: ChatItem) => {
    const mine = item.kind === "text" && item.role === "user";
    setQuote({ author: mine ? "You" : project.name, text: summarize(item).slice(0, 140) });
    setOverlay(null);
    focusInput();
  };

  const react = (item: ChatItem, emoji: string) => {
    // One reaction per message from the visitor, like the real apps (tap again to remove).
    chat.updateItem(item.id, (m) => ({ ...m, reactions: m.reactions?.[0] === emoji ? [] : [emoji] }));
    setOverlay(null);
  };

  const openActions = (item: ChatItem, rect: DOMRect, align: "start" | "end") => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return;
    setOverlay({
      type: "reactions",
      item,
      align,
      container: { width: box.width, height: box.height },
      anchor: { top: rect.top - box.top, bottom: rect.bottom - box.top, left: rect.left - box.left, right: rect.right - box.left, width: rect.width },
    });
  };

  const props: DemoViewProps = {
    project,
    items: chat.items,
    isTyping: chat.isTyping,
    isBusy: chat.isBusy,
    suggestions: chat.suggestions,
    live: chat.ready,
    reducedMotion,
    listRef,
    onListScroll,
    poweredBy: <PoweredByLine channel={channel} />,
    scrollButton: showJump ? (
      <button
        type="button"
        onClick={() => scrollToBottom(true)}
        aria-label={unread ? `Scroll to latest, ${unread} unread` : "Scroll to latest"}
        className={cn(
          "absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full shadow-lg",
          channel === "whatsapp" ? "bg-white text-[#54656F] dark:bg-[#202C33] dark:text-[#AEBAC1]" : "bg-white text-black shadow-md dark:bg-[#262626] dark:text-white",
        )}
      >
        <ChevronDown aria-hidden className="h-6 w-6" />
        {unread > 0 && (
          <span className={cn("absolute -top-1.5 right-0 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold", channel === "whatsapp" ? "bg-[#25D366] text-[#111B21]" : "bg-[#0095F6] text-white")}>
            {unread}
          </span>
        )}
      </button>
    ) : null,
    quote,
    onClearQuote: () => setQuote(null),
    onSend: send,
    onComposerSend: composerSend,
    onInteractive: (item, id) => void onInteractive(item, id),
    onReplyTo: replyTo,
    onActions: openActions,
    onReact: react,
    onOpenImage: (img) => setOverlay({ type: "image", ...img }),
    onOpenSlots: (item) => {
      setChosenSlot(null);
      setOverlay({ type: "slots", slots: item.slots });
    },
    onLocation: () => chat.pushLocal({ id: `note-${Date.now()}`, kind: "notice", text: "📍 Demo location for a fictional project. Maps open in a live deployment." }),
    onHeaderAction: (action) => {
      if (action === "menu") setMenuOpen((o) => !o);
      else setOverlay({ type: "call" });
    },
    menuOpen,
    onClearChat: () => {
      setMenuOpen(false);
      clear();
    },
    onRestart: () => {
      setMenuOpen(false);
      setQuote(null);
      restart();
    },
  };

  const isWa = channel === "whatsapp";
  const primary = isWa ? "bg-[#00A884] text-white dark:text-[#111B21]" : "bg-[#0095F6] text-white";

  return (
    <div ref={rootRef} className="relative h-full">
      {isWa ? <WhatsAppView {...props} /> : <InstagramView {...props} />}

      {overlay?.type === "reactions" && (
        <ReactionBar
          channel={channel}
          anchor={overlay.anchor}
          container={overlay.container}
          align={overlay.align}
          current={overlay.item.reactions}
          onReact={(emoji) => react(overlay.item, emoji)}
          onReply={() => replyTo(overlay.item)}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay?.type === "slots" && (
        <Sheet channel={channel} title="Available slots" onClose={() => setOverlay(null)}>
          <fieldset className="px-5 pt-2">
            <legend className="sr-only">Choose a site visit slot</legend>
            {overlay.slots.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center justify-between border-b border-black/[0.06] py-3.5 text-[16px] last:border-0 dark:border-white/10">
                <span>{s.label}</span>
                <input type="radio" name="slot" value={s.id} checked={chosenSlot === s.id} onChange={() => setChosenSlot(s.id)} className="h-5 w-5 accent-[#00A884]" />
              </label>
            ))}
          </fieldset>
          <div className="px-5 pt-3">
            <button
              type="button"
              disabled={!chosenSlot}
              onClick={() => {
                const slot = overlay.slots.find((s) => s.id === chosenSlot);
                setOverlay(null);
                if (slot) send(slot.label);
              }}
              className={cn("w-full rounded-full py-3 text-[16px] font-semibold disabled:opacity-50", primary)}
            >
              Send
            </button>
          </div>
        </Sheet>
      )}

      {overlay?.type === "call" && (
        <Sheet channel={channel} title="Talk to a Reazix specialist?" onClose={() => setOverlay(null)}>
          <p className="px-6 pb-4 text-center text-[15px] text-[#667781] dark:text-[#8696A0]">
            This is a demo chat. A Reazix specialist can call you back about building an AI concierge like this for your projects.
          </p>
          <div className="grid gap-2 px-5">
            <button
              type="button"
              onClick={() => {
                setOverlay(null);
                atBottom.current = true;
                void requestCallback();
              }}
              className={cn("rounded-full py-3 text-[16px] font-semibold", primary)}
            >
              Request a callback
            </button>
            <button type="button" onClick={() => setOverlay(null)} className="rounded-full py-3 text-[16px] font-semibold text-[#00A884] dark:text-[#25D366]">
              Cancel
            </button>
          </div>
        </Sheet>
      )}

      {overlay?.type === "image" && <ImageViewer title={overlay.title} caption={overlay.caption} background={overlay.background} onClose={() => setOverlay(null)} />}
    </div>
  );
}
