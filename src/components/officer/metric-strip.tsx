"use client";

import { GlassCard } from "@/components/glass";
import type { PayoutResult } from "@/lib/incentive-types";

type MetricStripProps = {
  payout: PayoutResult;
};

const metrics = [
  { key: "units", label: "Units this month", getValue: (p: PayoutResult) => String(p.totalUnits) },
  { key: "tier", label: "Current tier", getValue: (p: PayoutResult) => p.slabLabel },
  {
    key: "payout",
    label: "Est. payout",
    getValue: (p: PayoutResult) => `₹${p.totalPayout.toLocaleString()}`,
    accent: true,
  },
  {
    key: "next",
    label: "To next tier",
    getValue: (p: PayoutResult) =>
      p.nextTierDeltaUnits !== null ? `${p.nextTierDeltaUnits} units` : "Top tier",
  },
] as const;

export function MetricStrip({ payout }: MetricStripProps) {
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
            {metric.getValue(payout)}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
