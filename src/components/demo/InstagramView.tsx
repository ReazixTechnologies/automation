"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Camera, ExternalLink, FileText, Heart, ImageIcon, MapPin, Mic, Phone, Smile, Video, X } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { TypingIndicator } from "@/components/ui/TypingIndicator";
import { cn } from "@/lib/utils";
import type { ChatItem } from "@/types/simulator";
import { MessageShell } from "./MessageShell";
import type { DemoViewProps } from "./types";

/** Full-screen Instagram DM thread, styled after the current app (light + dark). */
export function InstagramView(p: DemoViewProps) {
  const { project, items } = p;
  const lastUserIndex = items.map((i) => i.kind === "text" && i.role === "user").lastIndexOf(true);
  const hasUserMessage = lastUserIndex >= 0;

  return (
    <div className="flex h-full flex-col bg-white text-black dark:bg-black dark:text-white">
      <header className="flex shrink-0 items-center gap-1 border-b border-black/[0.06] pb-1.5 pl-1 pr-1 pt-[max(0.375rem,env(safe-area-inset-top))] dark:border-white/10">
        <a href="/demo" aria-label="Back to demo chooser" className="flex h-11 w-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <ArrowLeft aria-hidden className="h-6 w-6" />
        </a>
        <span aria-hidden className="rounded-full bg-ig-gradient p-[2px]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#262626] text-[12px] font-semibold text-white dark:border-black">
            {project.initials}
          </span>
        </span>
        <div className="ml-2 min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 truncate text-[16px] font-semibold">
            {project.name}
            <BadgeCheck aria-label="Verified" className="h-4 w-4 shrink-0 fill-[#0095F6] text-white dark:text-black" />
          </p>
          <p aria-live="polite" className="truncate text-[12.5px] text-[#737373] dark:text-[#A8A8A8]">
            {p.isTyping ? "Typing…" : "Active now"}
          </p>
        </div>
        <button type="button" aria-label="Audio call" onClick={() => p.onHeaderAction("call")} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <Phone aria-hidden className="h-6 w-6" strokeWidth={1.8} />
        </button>
        <button type="button" aria-label="Video call" onClick={() => p.onHeaderAction("video")} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <Video aria-hidden className="h-[26px] w-[26px]" strokeWidth={1.8} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={p.listRef}
          onScroll={p.onListScroll}
          role="log"
          aria-live="polite"
          aria-label={`Messages with ${project.name}`}
          className="flex h-full flex-col gap-[2px] overflow-y-auto overscroll-contain px-3 pb-3"
        >
          {/* Profile intro, like the top of a real business thread */}
          <div className="flex flex-col items-center pb-6 pt-8 text-center">
            <span aria-hidden className="rounded-full bg-ig-gradient p-[3px]">
              <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-white bg-[#262626] text-[26px] font-semibold text-white dark:border-black">
                {project.initials}
              </span>
            </span>
            <p className="mt-3 flex items-center gap-1 text-[18px] font-semibold">
              {project.name}
              <BadgeCheck aria-label="Verified" className="h-[18px] w-[18px] fill-[#0095F6] text-white dark:text-black" />
            </p>
            <p className="text-[14px] text-[#737373] dark:text-[#A8A8A8]">{project.handle} · Instagram</p>
            <p className="text-[14px] text-[#737373] dark:text-[#A8A8A8]">{project.igStats}</p>
            <span aria-hidden className="mt-3 rounded-lg bg-[#EFEFEF] px-4 py-1.5 text-[14px] font-semibold dark:bg-[#262626]">
              View profile
            </span>
          </div>

          {items.map((item, i) => (
            <IgItem key={item.id} item={item} prev={items[i - 1]} showSeen={i === lastUserIndex} props={p} />
          ))}

          <AnimatePresence>{p.isTyping && <TypingIndicator key="typing" variant="instagram" label={`${project.name} is typing`} className="mt-1" />}</AnimatePresence>

          {/* Ice-breakers at the start; later, the AI's suggested replies */}
          {!p.isBusy && p.suggestions.length > 0 && p.live && (
            <div role="group" aria-label={hasUserMessage ? "Suggested replies" : "Ice breakers"} className="mt-3 flex flex-col items-end gap-2">
              {p.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => p.onSend(s)}
                  className="rounded-full border border-[#DBDBDB] px-4 py-2 text-[15px] font-medium active:bg-black/5 dark:border-[#363636] dark:active:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {p.scrollButton}
      </div>

      {p.quote && (
        <div className="flex shrink-0 items-center gap-2 border-t border-black/[0.06] px-4 py-2 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">Replying to {p.quote.author}</p>
            <p className="truncate text-[13px] text-[#737373] dark:text-[#A8A8A8]">{p.quote.text}</p>
          </div>
          <button type="button" onClick={p.onClearQuote} aria-label="Cancel reply" className="flex h-9 w-9 items-center justify-center rounded-full">
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
      )}
      <IgComposer onSend={p.onComposerSend} sendDisabled={p.isBusy} />
      {p.poweredBy}
    </div>
  );
}

function IgItem({ item, prev, showSeen, props: p }: { item: ChatItem; prev?: ChatItem; showSeen: boolean; props: DemoViewProps }) {
  const [burst, setBurst] = useState(0);
  const isUser = item.kind === "text" && item.role === "user";
  const prevUser = prev?.kind === "text" && prev.role === "user";
  const groupStart = !prev || prevUser !== isUser || prev.kind === "notice";
  const ts = "timestamp" in item ? item.timestamp : undefined;
  const prevTs = prev && "timestamp" in prev ? prev.timestamp : undefined;
  // Centered timestamps between groups, like Instagram.
  const showTime = ts && (!prev || (groupStart && ts !== prevTs));

  const heart = () => {
    p.onReact(item, "❤️");
    setBurst((b) => b + 1);
  };

  const shell = (label: string, children: ReactNode) => (
    <>
      {showTime && <p className="my-3 text-center text-[12px] font-medium text-[#737373] dark:text-[#A8A8A8]">Today {ts}</p>}
      <MessageShell
        label={label}
        align={isUser ? "end" : "start"}
        onReply={() => p.onReplyTo(item)}
        onActions={(rect) => p.onActions(item, rect, isUser ? "end" : "start")}
        onDoubleTap={heart}
        className={cn(groupStart && !showTime && "mt-2.5")}
      >
        <div className="relative max-w-full">
          {children}
          <AnimatePresence>
            {burst > 0 && !p.reducedMotion && (
              <motion.span
                key={burst}
                aria-hidden
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 1.25, 1], opacity: [0, 1, 1] }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.45 }}
                onAnimationComplete={() => setTimeout(() => setBurst(0), 250)}
                className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2", isUser ? "-left-9" : "-right-9")}
              >
                <Heart className="h-7 w-7 fill-[#FF3040] text-[#FF3040]" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </MessageShell>
    </>
  );

  const common = {
    variant: "instagram" as const,
    sender: isUser ? ("user" as const) : ("bot" as const),
    size: "native" as const,
    reactions: item.reactions,
    animate: !p.reducedMotion,
  };

  switch (item.kind) {
    case "text":
      return shell(
        `${isUser ? "You" : p.project.name}: ${item.text}`,
        <ChatBubble {...common} text={item.text} quote={item.quote} status={isUser && showSeen ? item.status : undefined} />,
      );
    case "notice":
      return <p className="my-3 text-center text-[12.5px] text-[#737373] dark:text-[#A8A8A8]">{item.text}</p>;
    case "units":
      return (
        <div className="flex flex-col gap-2">
          {item.units.map((u) => (
            <div key={u.id}>
              {shell(
                `${p.project.name} shared a post: ${u.label} from ${u.startingPrice}`,
                <Card>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-[#262626] text-[10px] font-semibold text-white">
                      {p.project.initials}
                    </span>
                    <span className="text-[14px] font-semibold">{p.project.handle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => p.onOpenImage({ title: `${u.label} · ${p.project.name}`, caption: u.highlights, background: u.gradient })}
                    aria-label={`View ${u.label} render`}
                    className="relative block aspect-square w-full"
                    style={{ background: u.gradient }}
                  >
                    <svg aria-hidden viewBox="0 0 160 160" className="absolute inset-0 h-full w-full text-white/25">
                      <path d="M0 120h160M20 120V70l30-20 30 20v50M90 120V55h50v65" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <span className="absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Illustrative</span>
                  </button>
                  <p className="px-3 py-2 text-[14px] leading-snug">
                    <span className="font-semibold">{p.project.handle}</span> {u.label} · from {u.startingPrice}* · {u.carpetSqft.toLocaleString("en-IN")} sq.ft carpet
                  </p>
                  <CardButton onClick={() => p.onSend(`Please send the ${u.label} floor plan`)} disabled={p.isBusy}>
                    View floor plan
                  </CardButton>
                </Card>,
              )}
            </div>
          ))}
        </div>
      );
    case "pdf":
      return shell(
        `${p.project.name} sent a link: ${item.name}`,
        <LinkCard icon={<FileText aria-hidden className="h-6 w-6" />} title={item.name.replace(/_/g, " ")} subtitle={`skylineheights.example · PDF · ${item.size}`} />,
      );
    case "location":
      return shell(
        `${p.project.name} sent a location: ${item.name}`,
        <button type="button" onClick={p.onLocation} className="text-left">
          <LinkCard icon={<MapPin aria-hidden className="h-6 w-6" />} title={item.name} subtitle={`${item.address} · ${item.hours}`} />
        </button>,
      );
    case "slots":
      return shell(
        `${p.project.name}: book a site visit`,
        <Card>
          <div className="px-3 pb-1 pt-3">
            <p className="text-[15px] font-semibold">Book a site visit</p>
            <p className="text-[14px] text-[#737373] dark:text-[#A8A8A8]">Experience Centre · pick a time</p>
          </div>
          {item.slots.map((s) => (
            <CardButton key={s.id} onClick={() => p.onSend(s.label)} disabled={p.isBusy}>
              {s.label}
            </CardButton>
          ))}
        </Card>,
      );
    case "handoff":
      return (
        <>
          <p className="my-3 text-center text-[12.5px] text-[#737373] dark:text-[#A8A8A8]">
            {item.agent === "Reazix" ? "A Reazix specialist will reach out" : `${item.agent} joined the conversation`}
          </p>
          {shell(`${item.agent}: ${item.reply}`, <ChatBubble {...common} author={item.agent === "Reazix" ? "Reazix" : item.agent} text={item.reply} />)}
        </>
      );
    case "interactive":
      return shell(
        `${p.project.name}: ${item.text}`,
        <Card>
          <p className="whitespace-pre-line px-3 py-3 text-[15px] leading-snug">{item.text}</p>
          {item.buttons.map((b) => (
            <CardButton key={b.id} onClick={() => p.onInteractive(item, b.id)} disabled={!!item.selectedId || p.isBusy} selected={item.selectedId === b.id}>
              {b.label}
            </CardButton>
          ))}
        </Card>,
      );
    case "cta":
      return shell(
        `${p.project.name}: ${item.text}`,
        <Card>
          <p className="px-3 py-3 text-[15px]">{item.text}</p>
          <a href={item.url} {...(item.url.startsWith("tel:") ? {} : { target: "_blank", rel: "noopener" })} className="flex items-center justify-center gap-2 border-t border-black/[0.08] py-2.5 text-[15px] font-semibold text-[#0095F6] dark:border-white/10">
            <ExternalLink aria-hidden className="h-4 w-4" /> {item.label}
          </a>
        </Card>,
      );
    default:
      return null;
  }
}

function Card({ children }: { children: ReactNode }) {
  return <div className="w-[72vw] max-w-[290px] overflow-hidden rounded-[18px] border border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#121212]">{children}</div>;
}

function CardButton({ children, onClick, disabled, selected }: { children: ReactNode; onClick: () => void; disabled?: boolean; selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full border-t border-black/[0.08] py-2.5 text-center text-[15px] font-semibold text-[#0095F6] active:bg-black/5 disabled:cursor-default dark:border-white/10 dark:active:bg-white/5",
        disabled && !selected && "opacity-60",
      )}
    >
      {children}
    </button>
  );
}

function LinkCard({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex w-[72vw] max-w-[290px] items-center gap-3 rounded-[18px] bg-[#EFEFEF] p-3 dark:bg-[#262626]">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0095F6] dark:bg-black">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold">{title}</span>
        <span className="block truncate text-[13px] text-[#737373] dark:text-[#A8A8A8]">{subtitle}</span>
      </span>
    </div>
  );
}

/** Camera in a blue circle, "Message…" field; mic / gallery / sticker switch to a blue "Send" when typing. */
function IgComposer({ onSend, sendDisabled }: { onSend: (text: string) => void; sendDisabled: boolean }) {
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
    <form onSubmit={submit} className="shrink-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div className="flex min-h-[46px] items-center gap-2 rounded-full bg-[#EFEFEF] pl-1.5 pr-3 dark:bg-[#262626]">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0095F6] text-white">
          <Camera className="h-5 w-5" />
        </span>
        <label htmlFor="ig-input" className="sr-only">
          Message
        </label>
        <input
          ref={inputRef}
          id="ig-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message…"
          maxLength={500}
          enterKeyHint="send"
          autoComplete="off"
          className="min-w-0 flex-1 select-text bg-transparent py-2 text-[16px] placeholder:text-[#737373] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:placeholder:text-[#A8A8A8]"
        />
        {hasText ? (
          <button type="submit" disabled={sendDisabled} className="text-[16px] font-semibold text-[#0095F6] disabled:opacity-50">
            Send
          </button>
        ) : (
          <span aria-hidden className="flex items-center gap-3.5">
            <Mic className="h-6 w-6" strokeWidth={1.8} />
            <ImageIcon className="h-6 w-6" strokeWidth={1.8} />
            <Smile className="h-6 w-6" strokeWidth={1.8} />
          </span>
        )}
      </div>
    </form>
  );
}
