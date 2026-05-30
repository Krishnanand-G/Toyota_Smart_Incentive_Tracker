"use client";

import { GlassCard } from "@/components/glass";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ModelBreakdown = { modelName: string; count: number };

type ModelBreakdownChartProps = {
  data: ModelBreakdown[];
};

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];

export function ModelBreakdownChart({ data }: ModelBreakdownChartProps) {
  const chartData = data.slice(0, 8);

  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales by model</h3>
        <p className="text-xs text-muted">Top models in selected period</p>
      </div>

      {!chartData.length ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted">
          No model breakdown yet.
        </div>
      ) : (
        <div className="h-56 w-full min-w-0">
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
                width={100}
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "rgba(20,20,22,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} sales`, "Units"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
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
