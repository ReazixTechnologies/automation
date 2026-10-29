"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatVariant, ScriptSlot } from "@/types/chat";

interface SlotPickerProps {
  slots: ScriptSlot[];
  /** Tapping a slot sends its label as the visitor's next message. */
  onSelect?: (slot: ScriptSlot) => void;
  disabled?: boolean;
  variant?: ChatVariant;
  /** Controlled selection (scripted playback); otherwise the picker tracks its own. */
  selectedId?: string;
}

export function SlotPicker({ slots, onSelect, disabled = false, variant = "whatsapp", selectedId }: SlotPickerProps) {
  const [ownChoice, setChosen] = useState<string | null>(null);
  const chosen = selectedId ?? ownChoice;
  const isWa = variant === "whatsapp";

  return (
    <div role="group" aria-label="Available site visit slots" className="mt-1 grid w-[90%] max-w-[280px] grid-cols-3 gap-1.5">
      {slots.map((slot) => {
        const active = slot.id === chosen;
        return (
          <motion.button
            key={slot.id}
            type="button"
            data-chat-option
            aria-pressed={active}
            aria-label={`Book ${slot.label}`}
            disabled={disabled || chosen !== null}
            onClick={() => {
              setChosen(slot.id);
              onSelect?.(slot);
            }}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "relative flex flex-col items-center rounded-lg border px-1 py-2 text-center transition-colors disabled:cursor-default",
              isWa
                ? "border-transparent bg-wa-incoming shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:bg-wa-incoming-dark"
                : "border-[#DBDBDB] bg-white dark:border-[#363636] dark:bg-[#121212]",
              active && (isWa ? "border-wa bg-wa-bubble dark:bg-wa-bubble-dark" : "border-ig-purple ring-1 ring-ig-purple"),
              chosen !== null && !active && "opacity-50",
            )}
          >
            {active && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-wa text-ink">
                <Check aria-hidden className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
            <CalendarDays aria-hidden className="mb-0.5 h-3.5 w-3.5 text-wa-deep dark:text-wa" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#667781] dark:text-[#8696A0]">
              {[slot.day, slot.date].filter(Boolean).join(" ")}
            </span>
            <span className="text-[12.5px] font-bold text-[#111B21] dark:text-[#E9EDEF]">{slot.time}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
