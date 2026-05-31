"use client";

import { GlassCard } from "@/components/glass";
import { chartColors, chartTooltipStyle } from "@/lib/chart-theme";
import { calculateIncentive } from "@/lib/incentive";
import type { SlabShape } from "@/lib/incentive-types";
import { useIsMobile } from "@/lib/use-is-mobile";
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
  const isMobile = useIsMobile();
  const maxUnits = computeMaxUnits(slabs);
  const data = buildCurveData(slabs, maxUnits);

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Payout curve</h3>
        <p className="text-xs text-muted">Total incentive vs units sold (step tiers)</p>
      </div>

      <div className="h-64 w-full min-w-0 lg:h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: isMobile ? 4 : -8, bottom: isMobile ? 16 : 0 }}
          >
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="units"
              tick={{ fill: chartColors.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Units",
                position: "insideBottom",
                offset: -2,
                fill: chartColors.axis,
                fontSize: 10,
              }}
            />
            <YAxis
              tick={{ fill: chartColors.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${Number(v) / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: chartColors.cursor, strokeWidth: 1 }}
              contentStyle={chartTooltipStyle}
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
              fill="rgba(235, 10, 30, 0.08)"
              stroke="none"
            />
            <Line
              type="stepAfter"
              dataKey="totalPayout"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine
              x={probeUnits}
              stroke={chartColors.secondary}
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
