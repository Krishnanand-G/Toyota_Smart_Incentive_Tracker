"use client";

import { GlassCard } from "@/components/glass";
import { chartColors, chartTooltipStyle } from "@/lib/chart-theme";
import { formatChartDayLabel } from "@/lib/date-picker-utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/lib/admin-dashboard-utils";
import { useIsMobile } from "@/lib/use-is-mobile";

type SalesTrendChartProps = {
  data: TrendPoint[];
  label: string;
};

export function SalesTrendChart({ data, label }: SalesTrendChartProps) {
  const isMobile = useIsMobile();
  const hasSales = data.some((point) => point.dailyUnits > 0);

  return (
    <GlassCard className="p-3 sm:p-5">
      <div className="mb-3 lg:mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales trend</h3>
        <p className="text-xs text-muted">Cumulative units — {label}</p>
      </div>

      {!hasSales ? (
        <div className="flex h-52 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted lg:h-56">
          No sales recorded in this period.
        </div>
      ) : (
        <div className="h-52 w-full min-w-0 lg:h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: isMobile ? 4 : -16, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDayLabel}
                interval="preserveStartEnd"
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: chartColors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: chartColors.cursor, strokeWidth: 1 }}
                contentStyle={chartTooltipStyle}
                labelFormatter={(label) => formatChartDayLabel(String(label))}
                formatter={(value, name) => [
                  `${value} units`,
                  name === "cumulativeUnits" ? "Cumulative" : "Daily",
                ]}
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
