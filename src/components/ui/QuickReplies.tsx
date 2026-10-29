"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatVariant, QuickReply } from "@/types/chat";

export type QuickReplyLayout = "chips" | "stacked" | "icebreakers";

export interface QuickRepliesProps {
  replies: QuickReply[];
  variant?: ChatVariant;
  /** Chosen reply; locks the group and animates the press. */
  selectedId?: string;
  onSelect?: (reply: QuickReply) => void;
  /**
   * chips: wrapped pills (default)
   * stacked: full-width WhatsApp interactive buttons attached under a bubble
   * icebreakers: right-aligned Instagram suggestion pills
   */
  layout?: QuickReplyLayout;
  align?: "start" | "end";
  label?: string;
  className?: string;
}

/**
 * Tappable reply options. Every button carries `data-chat-option` so a parent
 * can move focus to the first available option after a bot turn.
 */
export function QuickReplies({
  replies,
  variant = "whatsapp",
  selectedId,
  onSelect,
  layout = "chips",
  align = "start",
  label = "Quick replies",
  className,
}: QuickRepliesProps) {
  const isWa = variant === "whatsapp";
  const locked = selectedId !== undefined;

  const container = {
    chips: cn("mt-1.5 flex max-w-[92%] flex-wrap gap-1.5", align === "end" ? "justify-end self-end" : "justify-start"),
    stacked: "mt-1 flex w-[85%] max-w-[260px] flex-col gap-[3px]",
    icebreakers: "mt-2 flex max-w-[85%] flex-col items-end gap-1.5 self-end",
  }[layout];

  const button = {
    chips: cn(
      "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
      isWa
        ? "border-transparent bg-wa-incoming text-[#027EB5] shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:bg-wa-incoming-dark dark:text-[#53BDEB]"
        : "border-[#DBDBDB] bg-white text-ink dark:border-[#363636] dark:bg-black dark:text-white",
    ),
    stacked: cn(
      "w-full rounded-lg px-3 py-2 text-center text-[12.5px] font-semibold shadow-[0_1px_0.5px_rgb(11_18_21/0.13)]",
      isWa
        ? "bg-wa-incoming text-[#027EB5] dark:bg-wa-incoming-dark dark:text-[#53BDEB]"
        : "rounded-full border border-[#DBDBDB] bg-white text-ink dark:border-[#363636] dark:bg-black dark:text-white",
    ),
    icebreakers:
      "rounded-full border border-[#DBDBDB] bg-white px-3.5 py-2 text-right text-[12px] font-semibold text-ink dark:border-[#363636] dark:bg-black dark:text-white",
  }[layout];

  const selectedStyle = isWa ? "bg-wa-bubble ring-2 ring-wa/60 dark:bg-wa-bubble-dark" : "border-ig-purple ring-2 ring-ig-purple/40";

  return (
    <div role="group" aria-label={label} className={cn(container, className)}>
      {replies.map((reply) => {
        const selected = reply.id === selectedId;
        return (
          <motion.button
            key={reply.id}
            type="button"
            data-chat-option
            disabled={locked || !onSelect}
            aria-pressed={selected}
            onClick={() => onSelect?.(reply)}
            whileTap={{ scale: 0.94 }}
            animate={selected ? { scale: [1, 0.9, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "transition-colors enabled:hover:brightness-[0.97] disabled:cursor-default",
              button,
              selected && selectedStyle,
              locked && !selected && "opacity-50",
            )}
          >
            {reply.label}
          </motion.button>
        );
      })}
    </div>
  );
}
