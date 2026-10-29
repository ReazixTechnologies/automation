"use client";

import { animate, AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Database } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LeadField, LeadState } from "@/types/simulator";

const fields: { key: LeadField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "configuration", label: "Configuration" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "purpose", label: "Purpose" },
  { key: "visitSlot", label: "Site visit" },
];

const tagStyles: Record<string, string> = {
  "Hot Lead": "border-[#E5484D]/30 bg-[#E5484D]/10 text-[#B42318] dark:text-[#FF8A80]",
  HNI: "border-copper-400/40 bg-copper-400/15 text-copper-700 dark:text-copper-300",
};

/** Tags derived from what the AI captured. */
export function leadTags(lead: LeadState): string[] {
  const tags: string[] = [];
  if (lead.score >= 70) tags.push("Hot Lead");
  if (/4\s*cr|[5-9]\s*cr|\d{2}\s*cr|penthouse/i.test(`${lead.budget ?? ""} ${lead.configuration ?? ""}`)) tags.push("HNI");
  if (lead.purpose === "Investment") tags.push("Investor");
  if (lead.purpose === "Self-use") tags.push("End User");
  if (lead.visitSlot) tags.push("Site Visit Booked");
  return tags;
}

interface LeadCardProps {
  lead: LeadState;
  channel: string;
  className?: string;
}

/** Mini CRM record that fills in as the AI captures details. Collapsible below lg. */
export function LeadCard({ lead, channel, className }: LeadCardProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const captured = fields.filter((f) => lead[f.key]).length;
  const tags = leadTags(lead);
  const scoreTone = lead.score >= 70 ? "bg-copper-500" : lead.score >= 40 ? "bg-copper-400" : "bg-slate-400";

  return (
    <aside aria-label="Live CRM lead record" className={cn("overflow-hidden rounded-card border border-border bg-card shadow-card", className)}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-copper-500/15 text-copper-700 dark:text-copper-300">
          <Database aria-hidden className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Your CRM sees this live
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper-500 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-copper-500" />
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Score <span className="font-semibold tabular-nums text-foreground">{lead.score}</span> · {captured}/{fields.length} fields
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-foreground/5 hover:text-foreground lg:hidden"
        >
          {open ? "Hide" : "View"}
          <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <div id={bodyId} className={cn("px-4 pb-4 pt-3", !open && "hidden", "lg:block")}>
        <dl className="divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2">
            <dt className="text-xs font-medium text-muted-foreground">Channel</dt>
            <dd className="text-sm">
              <CapturedValue value={channel} />
            </dd>
          </div>
          {fields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-2">
              <dt className="shrink-0 text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="min-w-0 text-right text-sm">
                {lead[key] ? <CapturedValue value={lead[key]!} /> : <span className="text-muted-foreground/70">—</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">AI intent score</span>
            <span className="font-display text-base font-extrabold tabular-nums text-foreground">
              <AnimatedNumber value={lead.score} />
              <span className="text-xs font-semibold text-muted-foreground">/100</span>
            </span>
          </div>
          <div
            role="meter"
            aria-label="Lead score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={lead.score}
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className={cn("h-full rounded-full transition-colors duration-500", scoreTone)}
              initial={false}
              animate={{ width: `${lead.score}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-[28px] flex-wrap gap-1.5" aria-label="Tags">
          <AnimatePresence initial={false}>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", tagStyles[tag] ?? "border-copper-500/30 bg-copper-500/10 text-copper-700 dark:text-copper-300")}
              >
                {tag === "Hot Lead" ? "🔥 " : ""}
                {tag}
              </motion.span>
            ))}
          </AnimatePresence>
          {tags.length === 0 && <span className="text-xs text-muted-foreground">Tags appear as the buyer shares details</span>}
        </div>

        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">Illustrative demo data. Synced to your CRM in a live setup.</p>
      </div>
    </aside>
  );
}

/** Flashes a soft green highlight whenever the value changes. */
function CapturedValue({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ backgroundColor: "rgba(37, 211, 102, 0.35)", opacity: 0, x: 6 }}
      animate={{ backgroundColor: "rgba(37, 211, 102, 0)", opacity: 1, x: 0 }}
      transition={{ duration: 0.3, backgroundColor: { duration: 1.4 } }}
      className="inline-block max-w-full truncate rounded px-1.5 py-0.5 font-semibold text-foreground"
    >
      {value}
    </motion.span>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const controls = animate(prev.current, value, { duration: 0.6, onUpdate: (v) => setDisplay(Math.round(v)) });
    prev.current = value;
    return () => controls.stop();
  }, [value]);
  return <>{display}</>;
}
