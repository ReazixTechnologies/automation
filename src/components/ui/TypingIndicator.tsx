"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatSender, ChatVariant } from "@/types/chat";

interface TypingIndicatorProps {
  variant?: ChatVariant;
  sender?: ChatSender;
  /** Screen-reader text. */
  label?: string;
  className?: string;
}

/** Three bouncing dots inside a bubble. Pair with AnimatePresence for enter/exit. */
export function TypingIndicator({
  variant = "whatsapp",
  sender = "bot",
  label = "typing",
  className,
}: TypingIndicatorProps) {
  const isUser = sender === "user";
  const bubble =
    variant === "whatsapp"
      ? cn(
          "rounded-lg shadow-[0_1px_0.5px_rgb(11_18_21/0.13)]",
          isUser ? "bg-wa-bubble dark:bg-wa-bubble-dark" : "bg-wa-incoming dark:bg-wa-incoming-dark",
        )
      : cn("rounded-3xl", isUser ? "bg-ig-gradient" : "bg-[#EFEFEF] dark:bg-[#262626]");

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start", className)}
      role="status"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden className={cn("flex items-center gap-1 px-3.5 py-3", bubble)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 animate-typing-dot rounded-full",
              isUser && variant === "instagram" ? "bg-white" : "bg-slate-500 dark:bg-slate-300",
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
