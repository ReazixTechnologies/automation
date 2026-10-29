"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatNotice } from "@/components/ui/ChatNotice";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { project } from "@/data/projectKnowledge";
import { cn } from "@/lib/utils";
import type { Channel, ChatItem } from "@/types/simulator";
import { ChatInput } from "./ChatInput";
import { AgentHandoff } from "./messages/AgentHandoff";
import { LocationPin } from "./messages/LocationPin";
import { PdfAttachment } from "./messages/PdfAttachment";
import { SuggestionChips } from "./messages/QuickReplies";
import { SlotPicker } from "./messages/SlotPicker";
import { UnitCarousel } from "./messages/UnitCarousel";

const contact = { name: project.name, initials: "SH", handle: "skylineheights.homes", followers: "12.4K followers · 86 posts" };

interface ChatConversationProps {
  channel: Channel;
  items: ChatItem[];
  suggestions: string[];
  isTyping: boolean;
  isBusy: boolean;
  /** Conversation limit reached: input disabled. */
  locked: boolean;
  reducedMotion: boolean;
  onSend: (text: string) => void;
  onCaption: (text: string) => void;
  /** Text placed in the input by prefillLiveDemo(). */
  prefill?: { text: string; id: number } | null;
  className?: string;
}

/**
 * The live chat UI (header, messages, chips, input) without a frame. Rendered
 * inside the phone in #live-demo and inside the floating launcher's drawer;
 * both read the same LiveChatProvider state.
 */
export function ChatConversation({
  channel,
  items,
  suggestions,
  isTyping,
  isBusy,
  locked,
  reducedMotion,
  onSend,
  onCaption,
  prefill,
  className,
}: ChatConversationProps) {
  const isWa = channel === "whatsapp";
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasUserMessage = items.some((m) => m.kind === "text" && m.role === "user");
  const lastUserId = [...items].reverse().find((m) => m.kind === "text" && m.role === "user")?.id;
  const lastText = items[items.length - 1];
  const streamingLength = lastText?.kind === "text" ? lastText.text.length : 0;

  // Keep the newest content in view (also while tokens stream in).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [items.length, streamingLength, isTyping, suggestions.length, reducedMotion]);

  const status = isTyping ? (isWa ? "typing…" : "Typing…") : isWa ? "online" : "Active now";

  const render = (item: ChatItem, i: number) => {
    const prev = items[i - 1];
    const sender = item.kind === "text" && item.role === "user" ? "user" : "bot";
    const prevSender = prev && (prev.kind === "text" && prev.role === "user" ? "user" : prev.kind === "notice" ? "notice" : "bot");
    const tail = prevSender !== sender;
    const common = {
      variant: channel,
      sender: sender as "user" | "bot",
      tail,
      animate: !reducedMotion,
      className: prev && tail ? "mt-1.5" : undefined,
    } as const;
    const ts = "timestamp" in item && isWa ? item.timestamp : undefined;

    switch (item.kind) {
      case "text": {
        const status = item.role === "user" && (isWa || item.id === lastUserId) ? item.status : undefined;
        return (
          <ChatBubble
            key={item.id}
            {...common}
            timestamp={item.streaming ? undefined : ts}
            status={status}
            text={
              <>
                {item.text}
                {item.streaming && <span aria-hidden className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-current opacity-60" />}
              </>
            }
          />
        );
      }
      case "units":
        return (
          <ChatBubble key={item.id} {...common} bare>
            <UnitCarousel
              units={item.units}
              variant={channel}
              disabled={isBusy || locked}
              onViewFloorPlan={(u) => onSend(`Please send the ${u.label} floor plan`)}
            />
          </ChatBubble>
        );
      case "pdf":
        return (
          <ChatBubble key={item.id} {...common} timestamp={ts}>
            <PdfAttachment name={item.name} meta={`${item.pages} pages • PDF • ${item.size}`} variant={channel} />
          </ChatBubble>
        );
      case "slots":
        return (
          <SlotPicker key={item.id} slots={item.slots} variant={channel} disabled={isBusy || locked} onSelect={(slot) => onSend(slot.label)} />
        );
      case "location":
        return (
          <ChatBubble key={item.id} {...common} timestamp={ts}>
            <LocationPin
              title={item.name}
              address={`${item.address} · ${item.hours}`}
              onOpen={() => onCaption("Demo only: in a live chat this opens Google or Apple Maps")}
            />
          </ChatBubble>
        );
      case "handoff":
        return (
          <AgentHandoff key={item.id} agent={item.agent} team={item.team} reply={item.reply} timestamp={item.timestamp} variant={channel} animate={!reducedMotion} />
        );
      case "notice":
        return (
          <ChatNotice key={item.id} kind="system" variant={channel} className="my-1">
            {item.text}
          </ChatNotice>
        );
    }
  };

  const showChips = !isBusy && !locked && suggestions.length > 0;

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {/* Reskin crossfade; the conversation itself is unchanged. */}
        <motion.div
          key={channel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          // The reskinned list mounts fresh; open it at the newest message.
          onAnimationStart={() => {
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ChatHeader variant={channel} name={contact.name} initials={contact.initials} verified status={status} statusActive={isTyping} />

          <div className={cn("flex min-h-0 flex-1 flex-col", isWa ? "wa-wallpaper" : "bg-white dark:bg-black")}>
            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-busy={isBusy}
              aria-label={`Conversation with ${contact.name}`}
              className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 pb-3 pt-3 [scrollbar-width:thin]"
            >
              {isWa ? (
                <>
                  <ChatNotice kind="date">Today</ChatNotice>
                  <ChatNotice className="mb-1.5">Messages are end-to-end encrypted. Demo assistant, fictional project.</ChatNotice>
                </>
              ) : (
                <InstagramIntro />
              )}

              {items.map(render)}

              <AnimatePresence>
                {isTyping && <TypingIndicator key="typing" variant={channel} label={`${contact.name} is typing`} />}
              </AnimatePresence>

              {showChips && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  <SuggestionChips options={suggestions} variant={channel} starter={!hasUserMessage} onSelect={onSend} />
                </motion.div>
              )}
            </div>

            <ChatInput ref={inputRef} variant={channel} onSend={onSend} busy={isBusy} disabled={locked} prefill={prefill} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type SimulatorPhoneProps = ChatConversationProps;

/** ChatConversation inside the phone mockup used by the #live-demo section. */
export function SimulatorPhone({ className, ...props }: SimulatorPhoneProps) {
  const isWa = props.channel === "whatsapp";
  return (
    <PhoneFrame
      label={`Live AI concierge demo, ${isWa ? "WhatsApp" : "Instagram"} style`}
      statusBarTone={isWa ? "light" : "dark"}
      statusBarClassName={isWa ? "bg-wa-header dark:bg-wa-header-dark" : "bg-white dark:bg-black"}
      className={cn("max-w-[400px] lg:max-w-[360px]", className)}
    >
      <ChatConversation {...props} />
    </PhoneFrame>
  );
}

function InstagramIntro() {
  return (
    <div className="mb-3 flex flex-col items-center pt-2 text-center text-ink dark:text-white">
      <span className="rounded-full bg-ig-gradient p-[2.5px]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-ink-700 font-display text-lg font-bold text-white dark:border-black">
          {contact.initials}
        </span>
      </span>
      <p className="mt-2 text-[14px] font-semibold">{contact.name}</p>
      <p className="text-[11px] text-[#737373]">{contact.handle} · Instagram</p>
      <p className="text-[11px] text-[#737373]">{contact.followers}</p>
      <span aria-hidden className="mt-2 rounded-lg bg-[#EFEFEF] px-3 py-1 text-[11.5px] font-semibold dark:bg-[#262626]">
        View profile
      </span>
    </div>
  );
}
