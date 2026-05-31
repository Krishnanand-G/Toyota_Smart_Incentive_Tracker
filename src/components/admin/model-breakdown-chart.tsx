"use client";

import { GlassCard } from "@/components/glass";
import { chartColors, chartTooltipStyle } from "@/lib/chart-theme";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ModelBreakdown } from "@/lib/admin-dashboard-utils";
import { useIsMobile } from "@/lib/use-is-mobile";

type ModelBreakdownChartProps = {
  data: ModelBreakdown[];
};

const COLORS = ["#EB0A1E", "#C8091A", "#A00715", "#58595B", "#888888"];

function truncateLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}

export function ModelBreakdownChart({ data }: ModelBreakdownChartProps) {
  const isMobile = useIsMobile();
  const chartData = data.slice(0, 8);
  const yAxisWidth = isMobile ? 96 : 100;

  return (
    <GlassCard className="p-3 sm:p-5">
      <div className="mb-3 lg:mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales by model</h3>
        <p className="text-xs text-muted">Top models in selected period</p>
      </div>

      {!chartData.length ? (
        <div className="flex h-52 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted lg:h-56">
          No model breakdown yet.
        </div>
      ) : (
        <div className="h-52 w-full min-w-0 lg:h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="modelName"
                width={yAxisWidth}
                tick={{ fill: chartColors.axis, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => truncateLabel(String(value), isMobile ? 14 : 18)}
              />
              <Tooltip
                cursor={false}
                contentStyle={chartTooltipStyle}
                formatter={(value) => [`${value} sales`, "Units"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
