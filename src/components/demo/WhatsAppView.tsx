"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  ExternalLink,
  Info,
  List,
  Lock,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  SendHorizontal,
  Smile,
  Video,
  X,
} from "lucide-react";
import { Fragment, useRef, useState, type FormEvent } from "react";
import { PdfAttachment } from "@/components/simulator/messages/PdfAttachment";
import { LocationPin } from "@/components/simulator/messages/LocationPin";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { cn } from "@/lib/utils";
import type { ChatItem } from "@/types/simulator";
import { MessageShell } from "./MessageShell";
import type { DemoViewProps } from "./types";

/** Full-screen WhatsApp chat, styled after the current app (light + dark). */
export function WhatsAppView(p: DemoViewProps) {
  const { project, items } = p;
  return (
    <div className="flex h-full flex-col bg-[#EFEAE2] dark:bg-[#0B141A]">
      {/* Header */}
      <header className="relative z-20 flex shrink-0 items-center gap-1 bg-wa-header pb-1.5 pl-1 pr-1 pt-[max(0.375rem,env(safe-area-inset-top))] text-white dark:bg-wa-header-dark">
        <a href="/demo" aria-label="Back to demo chooser" className="flex h-11 w-9 items-center justify-center rounded-full active:bg-white/10">
          <ArrowLeft aria-hidden className="h-6 w-6" />
        </a>
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C8A96A] to-[#8A6D34] text-[14px] font-semibold text-white">
          {project.initials}
        </span>
        <div className="ml-2 min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 truncate text-[17px] font-medium">
            {project.name}
            <BadgeCheck aria-label="Verified business" className="h-[18px] w-[18px] shrink-0 fill-[#25D366] text-wa-header dark:text-wa-header-dark" />
          </p>
          <p aria-live="polite" className="truncate text-[13px] text-white/80">
            {p.isTyping ? "typing…" : "online"}
          </p>
        </div>
        <button type="button" aria-label="Video call" onClick={() => p.onHeaderAction("video")} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/10 hover:bg-white/10">
          <Video aria-hidden className="h-[22px] w-[22px]" />
        </button>
        <button type="button" aria-label="Voice call" onClick={() => p.onHeaderAction("call")} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/10 hover:bg-white/10">
          <Phone aria-hidden className="h-[20px] w-[20px]" />
        </button>
        <button
          type="button"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={p.menuOpen}
          onClick={() => p.onHeaderAction("menu")}
          className="flex h-11 w-10 items-center justify-center rounded-full active:bg-white/10 hover:bg-white/10"
        >
          <MoreVertical aria-hidden className="h-[22px] w-[22px]" />
        </button>
        <AnimatePresence>{p.menuOpen && <WaMenu onClear={p.onClearChat} onRestart={p.onRestart} onClose={() => p.onHeaderAction("menu")} />}</AnimatePresence>
      </header>

      {/* Thread */}
      <div className="wa-wallpaper relative min-h-0 flex-1">
        <div
          ref={p.listRef}
          onScroll={p.onListScroll}
          role="log"
          aria-live="polite"
          aria-label={`Chat with ${project.name}`}
          className="flex h-full flex-col gap-[3px] overflow-y-auto overscroll-contain px-[3%] pb-3 pt-2"
        >
          <p className="mx-auto mb-1.5 mt-1 flex max-w-[88%] items-start gap-1.5 rounded-lg bg-[#FFEECD] px-3 py-1.5 text-center text-[12.5px] leading-snug text-[#54656F] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#182229] dark:text-[#FFD279]">
            <Lock aria-hidden className="mt-0.5 h-3 w-3 shrink-0" />
            Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.
          </p>
          <p className="mx-auto my-1 rounded-lg bg-white px-3 py-1 text-[12.5px] font-medium text-[#54656F] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#182229] dark:text-[#8696A0]">Today</p>
          <p className="mx-auto mb-2 flex max-w-[88%] items-start gap-1.5 rounded-lg bg-white px-3 py-1.5 text-center text-[12.5px] leading-snug text-[#54656F] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#182229] dark:text-[#8696A0]">
            <Info aria-hidden className="mt-0.5 h-3 w-3 shrink-0" />
            This business uses a secure service from Meta to manage this chat. Tap to learn more.
          </p>

          {items.map((item, i) => (
            <WaItem key={item.id} item={item} prev={items[i - 1]} props={p} />
          ))}

          {/* AI suggestions / starters as WhatsApp reply buttons */}
          {!p.isBusy && p.suggestions.length > 0 && p.live && (
            <div className="ml-2 mt-0.5 flex w-[78%] max-w-[340px] flex-col gap-[3px]" role="group" aria-label="Suggested replies">
              {p.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => p.onSend(s)}
                  className="rounded-lg bg-white py-2.5 text-center text-[15px] font-medium text-[#027EB5] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] active:bg-[#F5F6F6] dark:bg-[#202C33] dark:text-[#53BDEB] dark:active:bg-[#2A3942]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence>{p.isTyping && <TypingIndicator key="typing" variant="whatsapp" label={`${project.name} is typing`} className="mt-1" />}</AnimatePresence>
        </div>
        {p.scrollButton}
      </div>

      {p.quote && <QuoteBar author={p.quote.author} text={p.quote.text} onClose={p.onClearQuote} />}
      <WaComposer onSend={p.onComposerSend} sendDisabled={p.isBusy} />
      {p.poweredBy}
    </div>
  );
}

function WaItem({ item, prev, props: p }: { item: ChatItem; prev?: ChatItem; props: DemoViewProps }) {
  const isUser = item.kind === "text" && item.role === "user";
  const prevUser = prev?.kind === "text" && prev.role === "user";
  const groupStart = !prev || prev.kind === "notice" || prevUser !== isUser;
  const ts = "timestamp" in item ? item.timestamp : undefined;
  const common = {
    variant: "whatsapp" as const,
    sender: isUser ? ("user" as const) : ("bot" as const),
    tail: groupStart,
    size: "native" as const,
    timestamp: ts,
    reactions: item.reactions,
    animate: !p.reducedMotion,
  };
  const shell = (label: string, children: React.ReactNode, opts: { reply?: boolean } = {}) => (
    <MessageShell
      label={label}
      align={isUser ? "end" : "start"}
      onReply={opts.reply === false ? undefined : () => p.onReplyTo(item)}
      onActions={(rect) => p.onActions(item, rect, isUser ? "end" : "start")}
      className={groupStart ? "mt-2" : undefined}
    >
      {children}
    </MessageShell>
  );

  switch (item.kind) {
    case "text":
      return shell(
        `${isUser ? "You" : p.project.name}: ${item.text}`,
        <ChatBubble {...common} text={item.text} quote={item.quote} status={isUser ? item.status : undefined} />,
      );
    case "notice":
      return (
        <p className="mx-auto my-1.5 max-w-[88%] rounded-lg bg-white px-3 py-1.5 text-center text-[12.5px] text-[#54656F] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#182229] dark:text-[#8696A0]">
          {item.text}
        </p>
      );
    case "units":
      // One image message per unit, with a caption and a reply button, like a real business sending renders.
      return (
        <div className={cn("flex flex-col gap-1.5", groupStart && "mt-2")}>
          {item.units.map((u, i) => (
            <Fragment key={u.id}>
              {shell(
              `${p.project.name}: ${u.label} from ${u.startingPrice}`,
              <div className="flex w-[78%] max-w-[330px] flex-col">
                <ChatBubble {...common} tail={i === 0 && groupStart} timestamp={ts}>
                  <button
                    type="button"
                    onClick={() => p.onOpenImage({ title: `${u.label} · ${p.project.name}`, caption: u.highlights, background: u.gradient })}
                    aria-label={`View ${u.label} render`}
                    className="relative block aspect-[4/3] w-full overflow-hidden rounded-md"
                    style={{ background: u.gradient }}
                  >
                    <svg aria-hidden viewBox="0 0 160 120" className="absolute inset-0 h-full w-full text-white/25">
                      <path d="M0 90h160M20 90V50l30-20 30 20v40M90 90V40h50v50M100 52h10v10h-10zM120 52h10v10h-10z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Illustrative</span>
                  </button>
                  <p className="px-1.5 pb-1 pt-1.5 text-[15.5px] leading-snug">
                    <strong className="font-semibold">{u.label}</strong> · from {u.startingPrice}*
                    <br />
                    <span className="text-[14px] opacity-80">
                      {u.carpetSqft.toLocaleString("en-IN")} sq.ft carpet · {u.unitsLeft} left
                    </span>
                  </p>
                </ChatBubble>
                <NativeButton onClick={() => p.onSend(`Please send the ${u.label} floor plan`)} disabled={p.isBusy}>
                  View floor plan
                </NativeButton>
              </div>,
              { reply: false },
              )}
            </Fragment>
          ))}
        </div>
      );
    case "pdf":
      return shell(
        `${p.project.name}: document ${item.name}`,
        <ChatBubble {...common}>
          <PdfAttachment name={item.name} meta={`${item.pages} pages • PDF • ${item.size}`} variant="whatsapp" />
        </ChatBubble>,
      );
    case "slots":
      // WhatsApp list message: text + "View slots" opens a bottom sheet with radio options.
      return shell(
        `${p.project.name}: pick a site visit slot`,
        <div className="flex w-[78%] max-w-[330px] flex-col">
          <ChatBubble {...common} text="Pick a time for your site visit at the Experience Centre 🗓️" />
          <NativeButton onClick={() => p.onOpenSlots(item)} disabled={p.isBusy}>
            <List aria-hidden className="h-[18px] w-[18px]" /> View slots
          </NativeButton>
        </div>,
        { reply: false },
      );
    case "location":
      return shell(
        `${p.project.name}: location ${item.name}`,
        <ChatBubble {...common}>
          <LocationPin title={item.name} address={`${item.address} · ${item.hours}`} onOpen={p.onLocation} />
        </ChatBubble>,
      );
    case "handoff":
      return (
        <>
          <p className="mx-auto my-1.5 rounded-lg bg-white px-3 py-1 text-center text-[12.5px] text-[#54656F] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#182229] dark:text-[#8696A0]">
            {item.agent === "Reazix" ? "A Reazix specialist will reach out" : `${item.agent} from ${item.team} joined the chat`}
          </p>
          {shell(`${item.agent}: ${item.reply}`, <ChatBubble {...common} tail author={item.agent === "Reazix" ? "Reazix" : `${item.agent} · ${item.team}`} text={item.reply} />)}
        </>
      );
    case "interactive":
      return shell(
        `${p.project.name}: ${item.text}`,
        <div className="flex w-[78%] max-w-[330px] flex-col">
          <ChatBubble {...common} text={item.text} />
          {item.buttons.map((b) => (
            <NativeButton key={b.id} onClick={() => p.onInteractive(item, b.id)} disabled={!!item.selectedId || p.isBusy} selected={item.selectedId === b.id}>
              {b.label}
            </NativeButton>
          ))}
        </div>,
        { reply: false },
      );
    case "cta":
      return shell(
        `${p.project.name}: ${item.text}`,
        <div className="flex w-[78%] max-w-[330px] flex-col">
          <ChatBubble {...common} text={item.text} />
          <a
            href={item.url}
            {...(item.url.startsWith("tel:") ? {} : { target: "_blank", rel: "noopener" })}
            className="mt-[3px] flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-[15px] font-medium text-[#027EB5] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#202C33] dark:text-[#53BDEB]"
          >
            <ExternalLink aria-hidden className="h-[18px] w-[18px]" /> {item.label}
          </a>
        </div>,
        { reply: false },
      );
    default:
      return null;
  }
}

/** WhatsApp interactive reply button (attached under a bubble). */
function NativeButton({ children, onClick, disabled, selected }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "mt-[3px] flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-[15px] font-medium text-[#027EB5] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] active:bg-[#F5F6F6] disabled:cursor-default dark:bg-[#202C33] dark:text-[#53BDEB] dark:active:bg-[#2A3942]",
        disabled && !selected && "opacity-60",
      )}
    >
      {children}
    </button>
  );
}

function QuoteBar({ author, text, onClose }: { author: string; text: string; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-stretch gap-2 bg-[#F0F2F5] px-2 pt-2 dark:bg-[#0B141A]">
      <div className="min-w-0 flex-1 rounded-lg border-l-4 border-[#06CF9C] bg-white px-3 py-1.5 dark:bg-[#1D282F]">
        <p className="text-[13.5px] font-semibold text-[#06CF9C]">{author}</p>
        <p className="truncate text-[14px] text-[#667781] dark:text-[#8696A0]">{text}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Cancel reply" className="flex h-10 w-10 items-center justify-center self-center rounded-full text-[#54656F] dark:text-[#8696A0]">
        <X aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Input bar: emoji, rounded "Message" field, attach + camera; mic morphs into the green send button. */
function WaComposer({ onSend, sendDisabled }: { onSend: (text: string) => void; sendDisabled: boolean }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasText = value.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasText || sendDisabled) return;
    onSend(value.trim());
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="flex shrink-0 items-end gap-1.5 bg-[#EFEAE2] px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 dark:bg-[#0B141A]">
      <div className="flex min-h-[48px] flex-1 items-center gap-1 rounded-[24px] bg-white pl-2 pr-1 shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] dark:bg-[#202C33]">
        <span aria-hidden className="flex h-10 w-9 items-center justify-center text-[#54656F] dark:text-[#8696A0]">
          <Smile className="h-6 w-6" />
        </span>
        <label htmlFor="wa-input" className="sr-only">
          Message
        </label>
        <input
          ref={inputRef}
          id="wa-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message"
          maxLength={500}
          enterKeyHint="send"
          autoComplete="off"
          className="min-w-0 flex-1 select-text bg-transparent py-2 text-[16px] text-[#111B21] placeholder:text-[#667781] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-[#E9EDEF] dark:placeholder:text-[#8696A0]"
        />
        <span aria-hidden className="flex h-10 w-9 items-center justify-center text-[#54656F] dark:text-[#8696A0]">
          <Paperclip className="h-[22px] w-[22px] -rotate-45" />
        </span>
        <AnimatePresence initial={false}>
          {!hasText && (
            <motion.span
              aria-hidden
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 36, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex h-10 items-center justify-center overflow-hidden text-[#54656F] dark:text-[#8696A0]"
            >
              <Camera className="h-[22px] w-[22px]" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <button
        type={hasText ? "submit" : "button"}
        aria-label={hasText ? "Send" : "Voice message (not available in demo)"}
        disabled={hasText && sendDisabled}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-white shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] active:scale-95 disabled:opacity-70 dark:text-[#111B21]"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span key={hasText ? "send" : "mic"} initial={{ scale: 0.4, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.15 }}>
            {hasText ? <SendHorizontal aria-hidden className="h-[22px] w-[22px]" /> : <Mic aria-hidden className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </form>
  );
}

function WaMenu({ onClear, onRestart, onClose }: { onClear: () => void; onRestart: () => void; onClose: () => void }) {
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-10" onClick={onClose} />
      <motion.ul
        role="menu"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ transformOrigin: "top right" }}
        className="absolute right-2 top-[calc(100%-6px)] z-20 w-48 rounded-lg bg-white py-2 text-[16px] text-[#111B21] shadow-xl dark:bg-[#233138] dark:text-[#E9EDEF]"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <li role="none">
          <button role="menuitem" type="button" autoFocus onClick={onClear} className="w-full px-5 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5">
            Clear chat
          </button>
        </li>
        <li role="none">
          <button role="menuitem" type="button" onClick={onRestart} className="w-full px-5 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5">
            Restart demo
          </button>
        </li>
      </motion.ul>
    </>
  );
}
