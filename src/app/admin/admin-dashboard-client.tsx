"use client";

import { AdminMetricStrip, OfficerLeaderboard, RecentActivityFeed } from "@/components/admin";
import { GlassAlert, GlassButton, GlassMonthPicker, GlassSkeleton, PageHeader } from "@/components/glass";
import type { DashboardRange } from "@/lib/admin-dashboard-utils";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const SalesTrendChart = dynamic(
  () => import("@/components/admin/sales-trend-chart").then((mod) => mod.SalesTrendChart),
  { loading: () => <GlassSkeleton className="h-64 w-full" /> },
);

const ModelBreakdownChart = dynamic(
  () => import("@/components/admin/model-breakdown-chart").then((mod) => mod.ModelBreakdownChart),
  { loading: () => <GlassSkeleton className="h-64 w-full" /> },
);

export type AdminDashboardData = {
  range: DashboardRange;
  label: string;
  monthKey: string | null;
  kpis: {
    totalSales: number;
    activeOfficers: number;
    registeredOfficers: number;
    avgSalesPerOfficer: number;
    totalIncentiveLiability: number;
  };
  salesTrend: { date: string; cumulativeUnits: number; dailyUnits: number }[];
  salesByModel: { modelName: string; count: number }[];
  officerLeaderboard: {
    officerId: string;
    officerName: string;
    units: number;
    payout: number;
  }[];
  recentActivity: {
    id: string;
    officerName: string;
    carName: string;
    soldAt: string;
  }[];
};

const rangeOptions: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

type AdminDashboardClientProps = {
  initialData: AdminDashboardData;
  initialRange: DashboardRange;
  initialMonthKey: string;
};

export function AdminDashboardClient({
  initialData,
  initialRange,
  initialMonthKey,
}: AdminDashboardClientProps) {
  const [range, setRange] = useState<DashboardRange>(initialRange);
  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetch = useRef(true);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range });
      if (range === "month") params.set("month", monthKey);
      const res = await fetch(`/api/admin/dashboard?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData((await res.json()) as AdminDashboardData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setRefreshing(false);
    }
  }, [range, monthKey]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      if (range === initialRange && monthKey === initialMonthKey) return;
    }
    void loadDashboard();
  }, [range, monthKey, loadDashboard, initialRange, initialMonthKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Studio"
        description="Analytics overview for sales performance and incentive liability."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {rangeOptions.map((option) => (
              <GlassButton
                key={option.value}
                type="button"
                variant={range === option.value ? "accent" : "secondary"}
                className={cn("!px-3 !py-1.5 !text-xs")}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </GlassButton>
            ))}
            {range === "month" ? (
              <GlassMonthPicker value={monthKey} onChange={setMonthKey} />
            ) : null}
            {refreshing ? <span className="text-xs text-muted">Updating…</span> : null}
          </div>
        }
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <div className={cn("space-y-6", refreshing && "opacity-80 transition-opacity")}>
        <AdminMetricStrip kpis={data.kpis} />

        <div className="grid gap-4 lg:grid-cols-2">
          <SalesTrendChart data={data.salesTrend} label={data.label} />
          <ModelBreakdownChart data={data.salesByModel} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <OfficerLeaderboard data={data.officerLeaderboard} />
          <RecentActivityFeed data={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
