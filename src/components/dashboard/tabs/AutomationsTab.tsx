"use client";

import { motion } from "framer-motion";
import { ArrowDown, Bell, CalendarCheck, FileText, Megaphone, Sparkles, UserCheck } from "lucide-react";
import { useId, useState } from "react";
import { automationToggles, flowEdges, flowNodes } from "@/data/dashboardDemo";
import { cn } from "@/lib/utils";

const VIEW_W = 1100;
const VIEW_H = 400;
const NODE_W = 170;

const nodeIcons = {
  ad: Megaphone,
  qualify: Sparkles,
  senior: UserCheck,
  nurture: FileText,
  visit: CalendarCheck,
  remind: Bell,
} as const;

type NodeId = (typeof flowNodes)[number]["id"];

const node = (id: string) => flowNodes.find((n) => n.id === id)!;

/** Smooth horizontal S-curve from the right edge of one node to the left edge of the next. */
function edgePath(from: string, to: string) {
  const a = node(from);
  const b = node(to);
  const x1 = a.x + NODE_W / 2;
  const x2 = b.x - NODE_W / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${x2} ${b.y}`;
}

export function AutomationsTab() {
  const [toggles, setToggles] = useState(automationToggles);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5">
      <h3 className="font-display text-lg font-bold text-foreground">Automations</h3>
      <p className="text-xs text-muted-foreground">Read-only preview of a lead-routing flow. Hover or focus a step for details.</p>

      <FlowDiagram />

      <h4 className="mt-6 text-sm font-semibold text-foreground">Ready-made automations</h4>
      <ul className="mt-2 divide-y divide-border rounded-card border border-border bg-card">
        {toggles.map((t) => {
          const id = `toggle-${t.id}`;
          return (
            <li key={t.id} className="flex items-center gap-4 p-3 sm:p-4">
              <div className="min-w-0 flex-1">
                <p id={id} className="text-sm font-semibold text-foreground">
                  {t.label}
                </p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={t.enabled}
                aria-labelledby={id}
                onClick={() => setToggles((list) => list.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)))}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", t.enabled ? "bg-copper-500" : "bg-muted ring-1 ring-inset ring-border")}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", t.enabled ? "right-0.5" : "left-0.5")}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FlowDiagram() {
  const [hovered, setHovered] = useState<NodeId | null>(null);
  const tipId = useId();
  const active = flowNodes.find((n) => n.id === hovered);

  return (
    <>
      {/* Desktop: canvas */}
      <div className="relative mt-4 hidden aspect-[1100/400] w-full overflow-hidden rounded-card border border-border bg-[radial-gradient(circle,rgb(var(--border))_1px,transparent_1px)] [background-size:18px_18px] md:block">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          {flowEdges.map(([a, b]) => (
            <path
              key={`${a}-${b}`}
              d={edgePath(a, b)}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="7 7"
              className={cn(
                "animate-[flow-dash_1.2s_linear_infinite] stroke-copper-500/70 dark:stroke-copper-400/70 motion-reduce:animate-none",
                hovered && (hovered === a || hovered === b) && "stroke-copper-400",
              )}
            />
          ))}
        </svg>
        {flowNodes.map((n) => {
          const Icon = nodeIcons[n.id];
          return (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(n.id)}
              onBlur={() => setHovered(null)}
              aria-describedby={hovered === n.id ? tipId : undefined}
              style={{ left: `${((n.x - NODE_W / 2) / VIEW_W) * 100}%`, top: `${(n.y / VIEW_H) * 100}%`, width: `${(NODE_W / VIEW_W) * 100}%` }}
              className={cn(
                "absolute -translate-y-1/2 rounded-xl border bg-card px-2.5 py-2 text-left shadow-soft transition-shadow",
                hovered === n.id ? "border-copper-500 shadow-glow-copper" : "border-border",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-copper-500/15 text-copper-700 dark:text-copper-300">
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-foreground lg:text-xs">{n.label}</span>
              </span>
            </button>
          );
        })}
        {active && (
          <div
            id={tipId}
            role="tooltip"
            className="pointer-events-none absolute z-10 w-56 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-card dark:bg-white dark:text-ink"
            style={{
              left: `${Math.min(Math.max((active.x / VIEW_W) * 100, 12), 82)}%`,
              top: `${((active.y + (active.y > 250 ? -70 : 46)) / VIEW_H) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {active.detail}
          </div>
        )}
      </div>

      {/* Mobile: vertical list of the same steps */}
      <ol className="mt-4 space-y-1 md:hidden" aria-label="Automation flow steps">
        {flowNodes.map((n, i) => {
          const Icon = nodeIcons[n.id];
          const branch = n.id === "senior" || n.id === "nurture";
          return (
            <li key={n.id}>
              <div className={cn("rounded-card border border-border bg-card p-3", branch && "ml-4")}>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon aria-hidden className="h-4 w-4 text-copper-700 dark:text-copper-300" />
                  {branch && <span className="text-xs font-normal text-muted-foreground">Branch:</span>}
                  {n.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{n.detail}</p>
              </div>
              {i < flowNodes.length - 1 && n.id !== "senior" && <ArrowDown aria-hidden className="mx-auto my-1 h-4 w-4 text-muted-foreground" />}
            </li>
          );
        })}
      </ol>
    </>
  );
}
