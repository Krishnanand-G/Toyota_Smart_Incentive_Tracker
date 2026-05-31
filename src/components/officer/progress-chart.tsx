"use client";

import { GlassCard } from "@/components/glass";
import { chartColors, chartTooltipStyle } from "@/lib/chart-theme";
import { formatChartDayLabel, formatMonthDisplay } from "@/lib/date-picker-utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartPoint } from "@/lib/sale-entry-utils";

type ProgressChartProps = {
  data: ChartPoint[];
  monthKey: string;
  totalUnits: number;
};

function formatDayLabel(date: string) {
  return formatChartDayLabel(date);
}

const axisTick = { fill: chartColors.axis, fontSize: 12 };

export function ProgressChart({ data, monthKey, totalUnits }: ProgressChartProps) {
  const hasSales = totalUnits > 0;

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Monthly progress</h3>
          <p className="text-xs text-muted">Cumulative units sold — {formatMonthDisplay(monthKey)}</p>
        </div>
      </div>

      {!hasSales ? (
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted lg:h-56">
          Log your first sale to see progress over time.
        </div>
      ) : (
        <div className="h-48 w-full min-w-0 lg:h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                interval="preserveStartEnd"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ stroke: chartColors.cursor, strokeWidth: 1 }}
                contentStyle={chartTooltipStyle}
                labelFormatter={(label) => formatDayLabel(String(label))}
                formatter={(value) => [`${value} units`, "Cumulative"]}
              />
              <Line
                type="monotone"
                dataKey="cumulativeUnits"
                stroke={chartColors.primary}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: chartColors.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
