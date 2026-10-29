"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/lib/chartTheme";
import { formatSmall, type RoiResult } from "@/lib/roi";

/**
 * Before/after as small multiples (site visits, bookings): the two measures
 * differ ~10× in scale, so they get separate axes rather than one shared one.
 */
export default function RoiChart({ result, animate }: { result: RoiResult; animate: boolean }) {
  const theme = useChartTheme();
  const panels = [
    { title: "Site visits / month", before: result.before.siteVisits, after: result.after.siteVisits },
    { title: "Bookings / month", before: result.before.bookings, after: result.after.bookings },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {panels.map((p) => {
        const data = [
          { name: "Today", value: p.before, fill: theme.baseline },
          { name: "With AI", value: p.after, fill: theme.primary },
        ];
        return (
          <div key={p.title} className="rounded-card border border-border bg-card p-3">
            <p className="text-xs font-semibold text-foreground">{p.title}</p>
            <div className="mt-2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer={false} data={data} margin={{ top: 18, right: 4, bottom: 0, left: -26 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={theme.grid} tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} />
                  <YAxis stroke={theme.grid} tick={{ fill: theme.axis, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: theme.grid, opacity: 0.4 }}
                    formatter={(v) => formatSmall(Number(v))}
                    contentStyle={{ background: theme.surface, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 12, color: theme.text }}
                    labelStyle={{ color: theme.text, fontWeight: 600 }}
                    itemStyle={{ color: theme.text }}
                  />
                  <Bar dataKey="value" name={p.title} barSize={24} radius={[4, 4, 0, 0]} isAnimationActive={animate}>
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(v) => formatSmall(Number(v))} fill={theme.text} fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
