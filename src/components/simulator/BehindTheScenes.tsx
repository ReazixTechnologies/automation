"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Gauge, Radar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedEntry } from "@/types/simulator";

const toneIcon = { intent: Radar, action: Zap, score: Gauge, system: Activity } as const;
const toneColor = {
  intent: "bg-ig-purple/10 text-ig-purple dark:text-[#C4A1F5]",
  action: "bg-copper-500/15 text-copper-700 dark:text-copper-300",
  score: "bg-copper-400/15 text-copper-700 dark:text-copper-300",
  system: "bg-muted text-muted-foreground",
} as const;

/** "What's happening behind the scenes" event log (desktop only). */
export function BehindTheScenes({ entries, className }: { entries: FeedEntry[]; className?: string }) {
  return (
    <section aria-labelledby="bts-title" className={cn("rounded-card border border-border bg-card/70 p-4 shadow-soft backdrop-blur", className)}>
      <h3 id="bts-title" className="text-sm font-semibold text-foreground">
        What&apos;s happening behind the scenes
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Automation events, as they fire.</p>
      <ol aria-live="polite" className="mt-4 flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {entries.map((e) => {
            const Icon = toneIcon[e.tone];
            return (
              <motion.li
                key={e.id}
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5"
              >
                <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", toneColor[e.tone])}>
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground">
                  {e.text}
                  <span className="block text-[11px] text-muted-foreground">{e.at}</span>
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {entries.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Send a message and watch intent detection, auto-sent brochures and lead scoring appear here.
          </li>
        )}
      </ol>
    </section>
  );
}
