"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { StatCounter } from "@/components/ui/StatCounter";
import { kpis } from "@/data/dashboardDemo";

// Recharts is only downloaded when the Analytics tab is opened.
const AnalyticsCharts = dynamic(() => import("../charts/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 xl:grid-cols-3" aria-busy="true" aria-label="Loading charts">
      <div className="h-[290px] animate-pulse rounded-card bg-muted xl:col-span-3" />
      <div className="h-[290px] animate-pulse rounded-card bg-muted xl:col-span-2" />
      <div className="h-[290px] animate-pulse rounded-card bg-muted" />
    </div>
  ),
});

export function AnalyticsTab() {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Analytics · this month</h3>
          <p className="text-xs text-muted-foreground">Demo data for the fictional Skyline Heights project</p>
        </div>
      </div>
      <ul className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="rounded-card border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <StatCounter
              value={k.value}
              decimals={k.decimals}
              prefix={k.prefix}
              suffix={k.suffix}
              label={k.delta}
              className="mt-1"
              valueClassName="text-2xl sm:text-[1.7rem]"
              labelClassName="text-[11px] sm:text-xs text-copper-700 dark:text-copper-300"
            />
          </li>
        ))}
      </ul>
      <AnalyticsCharts animate={!reduce} />
    </div>
  );
}
