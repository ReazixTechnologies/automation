"use client";

import { CalendarDays, CreditCard, Database, Globe, Megaphone, Sheet, Webhook, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import { InstagramGlyph } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, sectionIds } from "@/data/brand";
import { integrations, type IntegrationIcon } from "@/data/integrations";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";

const icons: Record<IntegrationIcon, LucideIcon | typeof InstagramGlyph> = {
  crm: Database,
  calendar: CalendarDays,
  sheet: Sheet,
  ads: Megaphone,
  instagram: InstagramGlyph,
  widget: Globe,
  webhook: Webhook,
  payment: CreditCard,
};

/** 5 × 3 grid on desktop: the hub takes the centre cell, tiles fill the rest. */
const COLS = 5;
const ROWS = 3;
// Hub in cell 7 (row 1, col 2). Symmetric layout: 5 tiles above, 2 either side, 2 below.
const cells = [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 13];

export function Integrations() {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);

  // Tile i sits in cells[i]; line from the hub centre to each tile centre (percent units).
  const lines = integrations.map((_, i) => {
    const cell = cells[i];
    return { x: ((cell % COLS) + 0.5) * (100 / COLS), y: (Math.floor(cell / COLS) + 0.5) * (100 / ROWS) };
  });

  return (
    <section id={sectionIds.integrations} aria-labelledby="integrations-title" className="section-y bg-muted/60">
      <div className="container">
        <SectionHeading
          id="integrations-title"
          eyebrow="Integrations"
          title="Plugs Into the Tools You Already Use"
          highlight="Already Use"
          description="We connect your concierge to the CRM, calendar and sheets you already run, so leads, bookings and payments flow in automatically."
        />

        <div ref={ref} className="relative mx-auto mt-12 max-w-5xl">
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
            {lines.map((l, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={l.x}
                y2={l.y}
                vectorEffect="non-scaling-stroke"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                className="animate-pulse-line stroke-copper-500/50 motion-reduce:animate-none dark:stroke-copper-400/50"
                style={{ animationDelay: `${(i % 4) * 0.3}s` }}
              />
            ))}
          </svg>

          <ul className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:grid-rows-3 lg:gap-x-8 lg:gap-y-10">
            <li className="col-span-2 flex items-center justify-center sm:col-span-3 lg:col-span-1 lg:col-start-3 lg:row-start-2">
              <div className="relative flex flex-col items-center">
                <span aria-hidden className="absolute h-24 w-24 animate-ping rounded-full bg-copper-500/20 motion-reduce:hidden" style={{ animationDuration: "2.4s" }} />
                {/* The Reazix "R" mark (icon derived from the logo file) at the hub. */}
                <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-ink-900 shadow-glow-copper ring-1 ring-copper-500/50">
                  <Image src="/brand/icon-512.png" alt="" width={80} height={80} className="h-20 w-20" />
                </span>
                <span className="relative mt-2 text-[11px] font-medium uppercase tracking-eyebrow text-foreground">{brand.name}</span>
              </div>
            </li>
            {integrations.map((it, i) => {
              const Icon = icons[it.icon];
              const cell = cells[i];
              return (
                <li
                  key={it.name}
                  style={{ ["--col" as string]: (cell % COLS) + 1, ["--row" as string]: Math.floor(cell / COLS) + 1 }}
                  className="lg:[grid-column-start:var(--col)] lg:[grid-row-start:var(--row)]"
                >
                  <div className="flex h-full items-center gap-3 rounded-card border border-border bg-card p-3 shadow-soft transition-colors hover:border-copper-500/50">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper-500/10 text-copper-700 dark:text-copper-300">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight text-foreground">{it.name}</span>
                      <span className="block text-xs text-muted-foreground">{it.category}</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Product names are trademarks of their respective owners and are shown as text only.
        </p>
      </div>
    </section>
  );
}
