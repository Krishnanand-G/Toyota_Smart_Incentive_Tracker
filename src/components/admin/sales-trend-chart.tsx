"use client";

import { GlassCard } from "@/components/glass";
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

export type TrendPoint = { date: string; cumulativeUnits: number; dailyUnits: number };

type SalesTrendChartProps = {
  data: TrendPoint[];
  label: string;
};

export function SalesTrendChart({ data, label }: SalesTrendChartProps) {
  const hasSales = data.some((point) => point.dailyUnits > 0);

  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales trend</h3>
        <p className="text-xs text-muted">Cumulative units — {label}</p>
      </div>

      {!hasSales ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted">
          No sales recorded in this period.
        </div>
      ) : (
        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDayLabel}
                interval="preserveStartEnd"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "rgba(249, 115, 22, 0.25)", strokeWidth: 1 }}
                contentStyle={{
                  background: "rgba(20,20,22,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => formatChartDayLabel(String(label))}
                formatter={(value, name) => [
                  `${value} units`,
                  name === "cumulativeUnits" ? "Cumulative" : "Daily",
                ]}
              />
              <Line
                type="monotone"
                dataKey="cumulativeUnits"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#f97316" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
