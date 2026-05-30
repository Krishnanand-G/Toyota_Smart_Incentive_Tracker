"use client";

import { GlassCard } from "@/components/glass";

type AdminKpis = {
  totalSales: number;
  activeOfficers: number;
  registeredOfficers: number;
  avgSalesPerOfficer: number;
  totalIncentiveLiability: number;
};

type AdminMetricStripProps = {
  kpis: AdminKpis;
};

const metrics = [
  {
    key: "sales",
    label: "Total sales",
    getValue: (k: AdminKpis) => String(k.totalSales),
  },
  {
    key: "officers",
    label: "Active sales officers",
    getValue: (k: AdminKpis) => `${k.activeOfficers} / ${k.registeredOfficers}`,
  },
  {
    key: "avg",
    label: "Avg per sales officer",
    getValue: (k: AdminKpis) => String(k.avgSalesPerOfficer),
  },
  {
    key: "liability",
    label: "Incentive liability",
    getValue: (k: AdminKpis) => `₹${k.totalIncentiveLiability.toLocaleString()}`,
    accent: true,
  },
] as const;

export function AdminMetricStrip({ kpis }: AdminMetricStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <GlassCard key={metric.key} className="border border-white/10 p-4">
          <p className="text-xs text-muted">{metric.label}</p>
          <p
            className={`mt-1 truncate text-lg font-semibold ${
              "accent" in metric && metric.accent ? "text-orange-400" : "text-foreground"
            }`}
          >
            {metric.getValue(kpis)}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
