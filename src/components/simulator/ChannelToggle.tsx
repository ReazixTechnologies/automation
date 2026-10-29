"use client";

import { motion } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { InstagramGlyph, WhatsAppGlyph } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/simulator";

const channels: { id: Channel; label: string; Icon: typeof WhatsAppGlyph }[] = [
  { id: "whatsapp", label: "WhatsApp", Icon: WhatsAppGlyph },
  { id: "instagram", label: "Instagram", Icon: InstagramGlyph },
];

interface ChannelToggleProps {
  value: Channel;
  onChange: (channel: Channel) => void;
  className?: string;
}

/** Segmented WhatsApp | Instagram switch (radio group with arrow-key support). */
export function ChannelToggle({ value, onChange, className }: ChannelToggleProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + channels.length) % channels.length;
    refs.current[next]?.focus();
    onChange(channels[next].id);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Messaging channel"
      className={cn("relative inline-flex rounded-full border border-border bg-card p-1 shadow-soft", className)}
    >
      {channels.map(({ id, label, Icon }, i) => {
        const active = value === id;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => !active && onChange(id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-4",
              active ? "text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="channel-pill"
                aria-hidden
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className={cn("absolute inset-0 rounded-full", id === "whatsapp" ? "bg-wa-deep" : "bg-ig-gradient" /* channel identity */)}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
