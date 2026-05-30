"use client";

import { GlassCard } from "@/components/glass";
import { calculateIncentive } from "@/lib/incentive";
import type { SlabShape } from "@/lib/incentive-types";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PayoutCurveChartProps = {
  slabs: SlabShape[];
  probeUnits: number;
};

function buildCurveData(slabs: SlabShape[], maxUnits: number) {
  const points = [];
  for (let units = 0; units <= maxUnits; units += 1) {
    const result = calculateIncentive(units, slabs);
    points.push({
      units,
      totalPayout: result.totalPayout,
      perUnit: result.perUnitAmount,
    });
  }
  return points;
}

function computeMaxUnits(slabs: SlabShape[]): number {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  const last = ordered.at(-1);
  if (!last) return 50;
  return Math.max((last.maxUnits ?? last.minUnits + 20) + 5, 50);
}

export function PayoutCurveChart({ slabs, probeUnits }: PayoutCurveChartProps) {
  const maxUnits = computeMaxUnits(slabs);
  const data = buildCurveData(slabs, maxUnits);

  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Payout curve</h3>
        <p className="text-xs text-muted">Total incentive vs units sold (step tiers)</p>
      </div>

        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis
              dataKey="units"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Units", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${Number(v) / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(249, 115, 22, 0.25)", strokeWidth: 1 }}
              contentStyle={{
                background: "rgba(20,20,22,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value, name) => [
                name === "totalPayout"
                  ? `₹${Number(value).toLocaleString()}`
                  : `₹${Number(value).toLocaleString()}/u`,
                name === "totalPayout" ? "Total payout" : "Per unit",
              ]}
              labelFormatter={(label) => `${label} units`}
            />
            <Area
              type="stepAfter"
              dataKey="totalPayout"
              fill="rgba(249,115,22,0.12)"
              stroke="none"
            />
            <Line
              type="stepAfter"
              dataKey="totalPayout"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine
              x={probeUnits}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
