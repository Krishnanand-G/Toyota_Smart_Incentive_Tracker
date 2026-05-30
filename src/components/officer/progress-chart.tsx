"use client";

import { GlassCard } from "@/components/glass";
import { formatMonthDisplay } from "@/lib/date-picker-utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartPoint = { date: string; cumulativeUnits: number };

type ProgressChartProps = {
  data: ChartPoint[];
  monthKey: string;
  totalUnits: number;
};

function formatDayLabel(date: string) {
  const day = date.split("-")[2];
  return day ? String(Number(day)) : date;
}

export function ProgressChart({ data, monthKey, totalUnits }: ProgressChartProps) {
  const hasSales = totalUnits > 0;

  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Monthly progress</h3>
          <p className="text-xs text-muted">Cumulative units sold — {formatMonthDisplay(monthKey)}</p>
        </div>
      </div>

      {!hasSales ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted">
          Log your first sale to see progress over time.
        </div>
      ) : (
        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
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
                labelFormatter={(label) => `Day ${formatDayLabel(String(label))}`}
                formatter={(value) => [`${value} units`, "Cumulative"]}
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
