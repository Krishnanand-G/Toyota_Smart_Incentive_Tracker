"use client";

import { GlassCard } from "@/components/glass";

type OfficerStats = {
  totalOfficers: number;
  officersWithSales: number;
  totalSales: number;
  activeThisMonth: number;
};

type OfficerStatsStripProps = {
  stats: OfficerStats;
};

const metrics = [
  {
    key: "total",
    label: "Total sales officers",
    getValue: (s: OfficerStats) => String(s.totalOfficers),
  },
  {
    key: "active",
    label: "With sales logged",
    getValue: (s: OfficerStats) => String(s.officersWithSales),
  },
  {
    key: "sales",
    label: "All-time sales",
    getValue: (s: OfficerStats) => String(s.totalSales),
  },
  {
    key: "month",
    label: "Sales this month",
    getValue: (s: OfficerStats) => String(s.activeThisMonth),
    accent: true,
    wideOnMobile: true,
  },
] as const;

export function OfficerStatsStrip({ stats }: OfficerStatsStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <GlassCard
          key={metric.key}
          className={`border border-border p-3 lg:p-4 ${
            "wideOnMobile" in metric && metric.wideOnMobile ? "col-span-2 lg:col-span-1" : ""
          }`}
        >
          <p className="text-xs text-muted">{metric.label}</p>
          <p
            className={`mt-1 text-base font-semibold lg:text-lg ${
              "accent" in metric && metric.accent ? "text-accent-primary" : "text-foreground"
            }`}
          >
            {metric.getValue(stats)}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}

export type { OfficerStats };
