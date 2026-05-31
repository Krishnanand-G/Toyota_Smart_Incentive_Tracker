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

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <GlassCard className="border border-border p-3.5 lg:p-4">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-base font-semibold leading-snug ${
          accent ? "text-accent-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </GlassCard>
  );
}

export function MetricStrip({ payout }: MetricStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          label={metric.label}
          value={metric.getValue(payout)}
          accent={"accent" in metric && metric.accent}
        />
      ))}
    </div>
  );
}
