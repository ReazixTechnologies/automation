"use client";

import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/simulator";
import { REACTIONS } from "../config";

interface ReactionBarProps {
  channel: Channel;
  /** Where the long-pressed message is, relative to the chat container. */
  anchor: { top: number; bottom: number; left: number; right: number; width: number };
  container: { width: number; height: number };
  align: "start" | "end";
  current?: string[];
  onReact: (emoji: string) => void;
  onReply: () => void;
  onClose: () => void;
}

/** Long-press menu: the six quick reactions plus Reply, positioned above the message. */
export default function ReactionBar({ channel, anchor, container, align, current = [], onReact, onReply, onClose }: ReactionBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isWa = channel === "whatsapp";

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const barWidth = 300;
  const above = anchor.top > 70;
  const top = above ? anchor.top - 58 : Math.min(anchor.bottom + 8, container.height - 120);
  const left = align === "end" ? Math.max(8, Math.min(anchor.right - barWidth, container.width - barWidth - 8)) : Math.max(8, Math.min(anchor.left, container.width - barWidth - 8));

  return (
    <div className="absolute inset-0 z-40" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div aria-hidden className="absolute inset-0 bg-black/25" onPointerDown={onClose} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-label="React to message"
        initial={{ opacity: 0, scale: 0.85, y: above ? 8 : -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute flex flex-col gap-2"
        style={{ top, left, width: barWidth }}
      >
        <div
          role="group"
          aria-label="Reactions"
          className={cn("flex items-center justify-between rounded-full px-2 py-1.5 shadow-xl", isWa ? "bg-white dark:bg-[#233138]" : "bg-white dark:bg-[#262626]")}
        >
          {REACTIONS.map((emoji, i) => (
            <motion.button
              key={emoji}
              type="button"
              aria-label={`React ${emoji}`}
              aria-pressed={current.includes(emoji)}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.025, type: "spring", stiffness: 600, damping: 24 }}
              whileTap={{ scale: 1.35 }}
              onClick={() => onReact(emoji)}
              className={cn("flex h-10 w-10 items-center justify-center rounded-full text-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A884]", current.includes(emoji) && "bg-black/10 dark:bg-white/15")}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        <button
          type="button"
          onClick={onReply}
          className={cn(
            "flex w-36 items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-medium shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A884]",
            align === "end" && "self-end",
            "bg-white text-[#111B21] dark:bg-[#233138] dark:text-[#E9EDEF]",
          )}
        >
          <Reply aria-hidden className="h-4 w-4" /> Reply
        </button>
      </motion.div>
    </div>
  );
}
