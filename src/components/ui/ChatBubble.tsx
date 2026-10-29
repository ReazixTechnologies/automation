"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, Download, FileText, Image as ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChatAttachment, ChatSender, ChatVariant, MessageStatus, QuickReply } from "@/types/chat";
import { QuickReplies, type QuickReplyLayout } from "./QuickReplies";

export interface ChatBubbleProps {
  variant?: ChatVariant;
  sender: ChatSender;
  text?: ReactNode;
  timestamp?: string;
  /** Delivery ticks (WhatsApp) or "Seen" (Instagram, read only), shown on user bubbles. */
  status?: MessageStatus;
  attachments?: ChatAttachment[];
  /** Rich content rendered inside the bubble above the text (cards, previews). */
  children?: ReactNode;
  /** Drop the bubble chrome and render `children` as-is (carousels, ad cards). */
  bare?: boolean;
  /** Sender label shown above the text, e.g. a human agent's name. */
  author?: string;
  /** Small note under the bubble, e.g. "✨ AI replied in 0.8s". */
  tag?: ReactNode;
  quickReplies?: QuickReply[];
  replyLayout?: QuickReplyLayout;
  /** Id of the chosen quick reply; disables the rest and animates a press. */
  selectedReplyId?: string;
  onQuickReply?: (reply: QuickReply) => void;
  /** Draw the speech tail (WhatsApp, first bubble in a group). */
  tail?: boolean;
  /** Animate in on mount. */
  animate?: boolean;
  /** "mock" (default) for phone mockups; "native" for the full-screen /demo chat (real-app text sizes). */
  size?: "mock" | "native";
  /** Reply-to preview shown at the top of the bubble (swipe-to-reply). */
  quote?: { author: string; text: string };
  /** Emoji reactions shown under the bubble. */
  reactions?: string[];
  className?: string;
}

export function ChatBubble({
  variant = "whatsapp",
  sender,
  text,
  timestamp,
  status,
  attachments,
  children,
  bare = false,
  author,
  tag,
  quickReplies,
  replyLayout = "chips",
  selectedReplyId,
  onQuickReply,
  tail = true,
  animate = true,
  size = "mock",
  quote,
  reactions,
  className,
}: ChatBubbleProps) {
  const native = size === "native";
  const isUser = sender === "user";
  const isWa = variant === "whatsapp";
  const hasText = text !== undefined && text !== null && text !== "";
  const hasMedia = Boolean(attachments?.length || children);

  const bubble = isWa
    ? cn(
        "rounded-lg text-[#111B21] shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:text-[#E9EDEF]",
        isUser ? "bg-wa-bubble dark:bg-wa-bubble-dark" : "bg-wa-incoming dark:bg-wa-incoming-dark",
        tail && (isUser ? "rounded-tr-none" : "rounded-tl-none"),
      )
    : cn(
        "rounded-[22px]",
        isUser ? "bg-gradient-to-br from-ig-purple to-ig-blue text-white" : "bg-[#EFEFEF] text-ink dark:bg-[#262626] dark:text-white",
        hasMedia && "rounded-2xl",
      );

  return (
    <motion.div
      layout="position"
      initial={animate ? { opacity: 0, y: 10, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
      style={{ transformOrigin: isUser ? "bottom right" : "bottom left" }}
      className={cn("flex w-full flex-col", isUser ? "items-end" : "items-start", className)}
    >
      {bare ? (
        children
      ) : (
        <div className={cn("relative", native ? "max-w-[80%]" : "max-w-[85%]", bubble, hasMedia ? "p-1" : native ? "px-2.5 py-[6px]" : "px-2.5 py-1.5")}>
          {isWa && tail && <BubbleTail side={isUser ? "right" : "left"} />}

          {author && (
            <p className={cn("text-[11.5px] font-semibold text-wa-deep dark:text-wa", hasMedia && "px-1.5 pt-1")}>{author}</p>
          )}

          {quote && (
            <div
              className={cn(
                "mb-1 rounded-md border-l-4 px-2 py-1",
                isWa ? "border-wa-teal bg-black/[0.05] dark:border-wa dark:bg-white/[0.07]" : "border-white/70 bg-black/10",
                hasMedia && "mx-1 mt-1",
              )}
            >
              <p className={cn("font-semibold", native ? "text-[13px]" : "text-[11px]", isWa ? "text-wa-teal dark:text-wa" : "")}>{quote.author}</p>
              <p className={cn("line-clamp-2 opacity-80", native ? "text-[13.5px]" : "text-[11.5px]")}>{quote.text}</p>
            </div>
          )}
          {children}
          {attachments?.map((a) => <AttachmentCard key={a.name} attachment={a} variant={variant} />)}

          {hasText && (
            <p className={cn("whitespace-pre-line select-text", native ? "text-[15.5px] leading-[1.35]" : "text-[13px] leading-[1.35]", hasMedia && "px-1.5 pt-1.5")}>
              {text}
              {/* Spacer so the timestamp never overlaps the last line */}
              {isWa && timestamp && <span aria-hidden className={cn("inline-block", native ? "w-[4.75rem]" : "w-[4.25rem]")} />}
            </p>
          )}

          {isWa && timestamp && (
            <span
              className={cn(
                "flex items-center gap-0.5 leading-none text-[#54656F] dark:text-[#8696A0]",
                native ? "text-[11px]" : "text-[10px]",
                isUser && "dark:text-[#CFE3DD]",
                hasText ? "absolute bottom-1.5 right-2" : "justify-end px-1.5 pb-0.5 pt-1",
              )}
            >
              <time>{timestamp}</time>
              {isUser && status && <StatusTicks status={status} />}
            </span>
          )}
        </div>
      )}

      {reactions && reactions.length > 0 && (
        <span
          className={cn(
            "relative z-[1] -mt-1.5 flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 shadow-sm",
            isWa ? "border-[#E9EDEF] bg-white dark:border-[#0B141A] dark:bg-[#202C33]" : "border-white bg-[#EFEFEF] dark:border-black dark:bg-[#262626]",
            isUser ? "mr-2" : "ml-2",
            native ? "text-[15px]" : "text-[11px]",
          )}
          aria-label={`Reactions: ${reactions.join(" ")}`}
        >
          {reactions.map((e, i) => (
            <span key={`${e}-${i}`} aria-hidden>
              {e}
            </span>
          ))}
        </span>
      )}

      {tag && <span className="mt-1 px-1 text-[10.5px] font-medium text-[#54656F] dark:text-[#8696A0]">{tag}</span>}

      {!isWa && timestamp && <span className="mt-1 px-2 text-[10px] text-muted-foreground">{timestamp}</span>}
      {!isWa && isUser && status === "read" && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-0.5 px-2 text-[10.5px] text-muted-foreground">
          Seen
        </motion.span>
      )}

      {quickReplies && quickReplies.length > 0 && (
        <QuickReplies
          replies={quickReplies}
          variant={variant}
          layout={replyLayout}
          selectedId={selectedReplyId}
          onSelect={onQuickReply}
          align={isUser ? "end" : "start"}
        />
      )}
    </motion.div>
  );
}

function BubbleTail({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 8 13"
      width="8"
      height="13"
      className={cn(
        "absolute top-0",
        side === "left"
          ? "-left-2 text-wa-incoming dark:text-wa-incoming-dark"
          : "-right-2 -scale-x-100 text-wa-bubble dark:text-wa-bubble-dark",
      )}
    >
      <path fill="currentColor" d="M8 0H1.5C.2 0-.4 1.5.5 2.4L8 10V0Z" />
    </svg>
  );
}

function StatusTicks({ status }: { status: MessageStatus }) {
  const label = { sent: "Sent", delivered: "Delivered", read: "Read" }[status];
  return (
    <span className="ml-0.5 inline-flex" role="img" aria-label={label}>
      {status === "sent" ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <CheckCheck
          className={cn("h-3.5 w-3.5 transition-colors duration-300", status === "read" && "text-wa-tick")}
          strokeWidth={2.5}
        />
      )}
    </span>
  );
}

export function AttachmentCard({ attachment, variant = "whatsapp" }: { attachment: ChatAttachment; variant?: ChatVariant }) {
  if (attachment.type === "image") {
    return (
      <div
        className="flex aspect-[4/3] w-52 items-center justify-center rounded-md bg-gradient-to-br from-copper-300 to-wa-teal"
        style={attachment.preview ? { background: attachment.preview, backgroundSize: "cover" } : undefined}
        role="img"
        aria-label={attachment.name}
      >
        {!attachment.preview && <ImageIcon className="h-8 w-8 text-white/80" aria-hidden />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-56 max-w-full items-center gap-2.5 rounded-md p-2.5",
        variant === "whatsapp" ? "bg-black/[0.04] dark:bg-white/[0.06]" : "bg-black/[0.05] dark:bg-white/10",
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-8 shrink-0 flex-col items-center justify-center rounded-[4px] bg-[#C2333A] text-[8px] font-bold text-white"
      >
        <FileText className="h-3.5 w-3.5" />
        {attachment.type === "pdf" ? "PDF" : "DOC"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium">{attachment.name}</span>
        {attachment.meta && <span className="block text-[10.5px] opacity-70">{attachment.meta}</span>}
      </span>
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/20 opacity-60 dark:border-white/30"
      >
        <Download className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}
