"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatVariant } from "@/types/chat";
import type { UnitCardData } from "@/types/simulator";

interface UnitCarouselProps {
  units: UnitCardData[];
  variant?: ChatVariant;
  /** "View Floor Plan" sends a message on the visitor's behalf. */
  onViewFloorPlan?: (unit: UnitCardData) => void;
  disabled?: boolean;
}

/** Swipeable unit cards. CSS gradient placeholders stand in for renders. */
export function UnitCarousel({ units, variant = "whatsapp", onViewFloorPlan, disabled }: UnitCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const isWa = variant === "whatsapp";
  const scrollBy = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });

  return (
    <div className="w-full">
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Unit options, scroll horizontally"
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {units.map((u) => (
          <li
            key={u.id}
            className={cn(
              "flex w-[170px] shrink-0 snap-start flex-col overflow-hidden",
              isWa
                ? "rounded-lg bg-wa-incoming shadow-[0_1px_0.5px_rgb(11_18_21/0.13)] dark:bg-wa-incoming-dark"
                : "rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-[#262626]",
            )}
          >
            <div role="img" aria-label={`${u.label} render (illustrative placeholder)`} className="relative flex aspect-[16/10] items-end p-2" style={{ background: u.gradient }}>
              <svg aria-hidden viewBox="0 0 160 100" className="absolute inset-0 h-full w-full text-white/25" preserveAspectRatio="xMidYMid slice">
                <path d="M0 80h160M20 80V42l26-18 26 18v38M88 80V30h46v50M98 42h9v9h-9zM117 42h9v9h-9z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="relative rounded bg-black/35 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                Illustrative
              </span>
              {u.unitsLeft <= 5 && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#B42318]">
                  Only {u.unitsLeft} left
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col px-2.5 pb-2 pt-1.5 text-[#111B21] dark:text-[#E9EDEF]">
              <p className="text-[12.5px] font-semibold">{u.label}</p>
              <p className="text-[13px] font-bold text-wa-deep dark:text-wa">
                from {u.startingPrice}
                <span className="font-normal text-[#667781] dark:text-[#8696A0]">*</span>
              </p>
              <p className="text-[10.5px] text-[#667781] dark:text-[#8696A0]">
                {u.carpetSqft.toLocaleString("en-IN")} sq.ft carpet · {u.unitsLeft} left
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#667781] dark:text-[#8696A0]">{u.highlights}</p>
              <motion.button
                type="button"
                data-chat-option
                disabled={disabled || !onViewFloorPlan}
                onClick={() => onViewFloorPlan?.(u)}
                whileTap={{ scale: 0.95 }}
                className="mt-2 flex items-center justify-center gap-1 rounded-md border-t border-black/5 pt-1.5 text-[11.5px] font-semibold text-[#027EB5] disabled:opacity-50 dark:border-white/10 dark:text-[#53BDEB]"
              >
                <FileText aria-hidden className="h-3.5 w-3.5" />
                View Floor Plan
              </motion.button>
            </div>
          </li>
        ))}
      </ul>
      {units.length > 1 && (
        <div className="mt-1 flex gap-1">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir < 0 ? "Previous unit" : "Next unit"}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-[#54656F] hover:bg-black/10 dark:bg-white/10 dark:text-white"
            >
              {dir < 0 ? <ChevronLeft aria-hidden className="h-3.5 w-3.5" /> : <ChevronRight aria-hidden className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
      <p className="mt-0.5 px-0.5 text-[9.5px] text-[#667781] dark:text-[#8696A0]">*Starting price, illustrative. Excl. registration.</p>
    </div>
  );
}
