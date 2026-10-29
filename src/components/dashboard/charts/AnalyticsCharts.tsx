"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { leadSources, leadsPerDay, scoreDistribution } from "@/data/dashboardDemo";
import { useChartTheme, type ChartTheme } from "@/lib/chartTheme";

/** Shared tooltip styling: surface + text tokens, never the series color for text. */
function tooltipProps(theme: ChartTheme) {
  return {
    contentStyle: {
      background: theme.surface,
      border: `1px solid ${theme.grid}`,
      borderRadius: 10,
      fontSize: 12,
      color: theme.text,
      boxShadow: "0 8px 24px rgb(11 18 21 / 0.12)",
    },
    labelStyle: { color: theme.text, fontWeight: 600 },
    itemStyle: { color: theme.text },
  };
}

function ChartCard({ title, summary, children, className }: { title: string; summary: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={`rounded-card border border-border bg-card p-4 ${className ?? ""}`}>
      <figcaption className="text-sm font-semibold text-foreground">{title}</figcaption>
      <p className="sr-only">{summary}</p>
      <div aria-hidden className="mt-3">
        {children}
      </div>
    </figure>
  );
}

export default function AnalyticsCharts({ animate }: { animate: boolean }) {
  const theme = useChartTheme();
  const daily = useMemo(() => leadsPerDay(), []);
  const totals = daily.reduce((acc, d) => ({ wa: acc.wa + d.whatsapp, ig: acc.ig + d.instagram }), { wa: 0, ig: 0 });
  const axis = { stroke: theme.grid, tick: { fill: theme.axis, fontSize: 11 }, tickLine: false };
  const scoreColors = [theme.hot, theme.warm, theme.cold];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartCard
        className="xl:col-span-3"
        title="Leads per day by channel · last 30 days"
        summary={`Line chart of daily leads over the last 30 days. WhatsApp: ${totals.wa} leads in total; Instagram: ${totals.ig}. Both trend upward with weekend peaks.`}
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart accessibilityLayer={false} data={daily} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid stroke={theme.grid} vertical={false} />
              <XAxis dataKey="date" {...axis} interval="preserveStartEnd" minTickGap={24} />
              <YAxis {...axis} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltipProps(theme)} cursor={{ stroke: theme.axis, strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: theme.text }} iconType="plainline" />
              <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke={theme.whatsapp} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }} isAnimationActive={animate} />
              <Line type="monotone" dataKey="instagram" name="Instagram" stroke={theme.instagram} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }} isAnimationActive={animate} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title="Lead sources · this month"
        summary={`Bar chart of leads by source: ${leadSources.map((s) => `${s.source} ${s.leads}`).join(", ")}.`}
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer={false} data={leadSources} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 8 }}>
              <CartesianGrid stroke={theme.grid} horizontal={false} />
              <XAxis type="number" {...axis} allowDecimals={false} />
              <YAxis type="category" dataKey="source" {...axis} axisLine={false} width={104} />
              <Tooltip {...tooltipProps(theme)} cursor={{ fill: theme.grid, opacity: 0.5 }} />
              <Bar
                dataKey="leads"
                name="Leads"
                fill={theme.primary}
                barSize={18}
                radius={[0, 4, 4, 0]}
                isAnimationActive={animate}
                label={{ position: "right", fill: theme.axis, fontSize: 11 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Lead score distribution"
        summary={`Donut chart: ${scoreDistribution.map((s) => `${s.name} (${s.range}) ${s.value}%`).join(", ")}.`}
      >
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer={false}>
              <Tooltip {...tooltipProps(theme)} formatter={(v) => `${v}%`} />
              <Pie
                data={scoreDistribution.map((s) => ({ ...s }))}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                stroke={theme.surface}
                strokeWidth={2}
                isAnimationActive={animate}
              >
                {scoreDistribution.map((s, i) => (
                  <Cell key={s.name} fill={scoreColors[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-extrabold text-foreground">{scoreDistribution[0].value}%</span>
            <span className="text-[11px] text-muted-foreground">Hot leads</span>
          </span>
        </div>
        <ul className="mt-2 flex justify-center gap-4 text-xs text-foreground">
          {scoreDistribution.map((s, i) => (
            <li key={s.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: scoreColors[i] }} />
              {s.name} {s.value}%
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}
