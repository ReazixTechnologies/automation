"use client";

import { QuickReplies as BaseQuickReplies } from "@/components/ui/QuickReplies";
import type { ChatVariant } from "@/types/chat";

interface SuggestionChipsProps {
  options: string[];
  variant: ChatVariant;
  onSelect: (text: string) => void;
  /** Starter prompts before the first message: Instagram shows them as ice-breakers. */
  starter?: boolean;
  label?: string;
}

/** Maps plain-text suggestions onto the shared QuickReplies with channel-appropriate layout. */
export function SuggestionChips({ options, variant, onSelect, starter = false, label }: SuggestionChipsProps) {
  return (
    <BaseQuickReplies
      replies={options.map((o, i) => ({ id: `${i}-${o}`, label: o }))}
      variant={variant}
      layout={variant === "instagram" && starter ? "icebreakers" : "chips"}
      label={label ?? (starter ? "Suggested questions" : "Suggested replies")}
      onSelect={(reply) => onSelect(reply.label)}
    />
  );
}
