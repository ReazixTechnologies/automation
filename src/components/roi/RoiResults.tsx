"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarCheck, Clock, Home, IndianRupee } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { brand } from "@/data/brand";
import { useNearViewport } from "@/hooks/useScriptPlayer";
import { formatCount, formatINR, formatSmall, type RoiResult } from "@/lib/roi";

function ChartSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden>
      <div className="h-[198px] animate-pulse rounded-card bg-muted" />
      <div className="h-[198px] animate-pulse rounded-card bg-muted" />
    </div>
  );
}

const RoiChart = dynamic(() => import("./RoiChart"), { ssr: false, loading: ChartSkeleton });

export function RoiResults({ result }: { result: RoiResult }) {
  const reduce = useReducedMotion() ?? false;
  const chartRef = useRef<HTMLDivElement>(null);
  // Recharts is fetched only once the results card is close to the viewport.
  const chartNear = useNearViewport(chartRef, "400px");
  const metrics = [
    { label: "Extra site visits / month", value: result.extraSiteVisits, format: formatSmall, Icon: CalendarCheck },
    { label: "Extra bookings / month", value: result.extraBookings, format: formatSmall, Icon: Home },
    { label: "Extra monthly commission", value: result.extraRevenue, format: (n: number) => formatINR(n), Icon: IndianRupee },
    { label: "Team hours saved / month", value: result.hoursSavedPerMonth, format: formatCount, Icon: Clock },
  ];

  const visits = Math.round(result.extraSiteVisits);
  const bookings = result.extraBookings;
  const summary =
    visits < 1
      ? "With these inputs the gain is small. Try a slower current response time or a higher lead volume."
      : `With instant replies, you could book about ${visits} more site visit${visits === 1 ? "" : "s"} and ${formatSmall(bookings)} more home${
          bookings >= 0.95 && bookings < 1.05 ? "" : "s"
        } each month.`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h3 className="font-display text-lg font-bold text-foreground">Your projected monthly upside</h3>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, format, Icon }) => (
          <div key={label} className="rounded-card border border-border bg-muted/50 p-3 sm:p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Icon aria-hidden className="h-3.5 w-3.5 text-copper-700 dark:text-copper-300" />
              {label}
            </dt>
            <dd className="mt-1 font-display text-xl font-extrabold text-foreground sm:text-2xl">
              <AnimatedNumber value={value} format={format} />
            </dd>
          </div>
        ))}
      </dl>

      <p aria-live="polite" className="mt-5 rounded-card bg-copper-500/10 px-4 py-3 text-sm font-medium leading-relaxed text-foreground">
        {summary}
      </p>

      <div className="mt-5">
        <p className="sr-only">
          Before and after: site visits per month go from {formatSmall(result.before.siteVisits)} today to {formatSmall(result.after.siteVisits)} with
          the AI concierge; bookings go from {formatSmall(result.before.bookings)} to {formatSmall(result.after.bookings)}.
        </p>
        <div ref={chartRef} aria-hidden>
          {chartNear ? <RoiChart result={result} animate={!reduce} /> : <ChartSkeleton />}
        </div>
      </div>

      {/* Stacked until 2xl: the results column is too narrow for both buttons side by side. */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col 2xl:flex-row">
        <Button href={brand.cta.demo.href} size="lg" rightIcon={<ArrowRight aria-hidden className="h-4 w-4" />} className="flex-1">
          Get a personalized ROI walkthrough
        </Button>
        <Button href={brand.cta.primary.href} variant="outline" size="lg" className="flex-1">
          {brand.cta.primary.label}
        </Button>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Estimates based on your inputs and the stated assumptions. Not a guarantee of results.
      </p>
    </div>
  );
}
