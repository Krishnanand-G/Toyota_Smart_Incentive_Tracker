"use client";

import { GlassAlert, GlassMonthPicker, PageHeader } from "@/components/glass";
import { LiveTracker } from "@/components/incentive/live-tracker";
import { TierLadder } from "@/components/incentive/tier-ladder";
import { MetricStrip } from "@/components/officer/metric-strip";
import { ProgressChart } from "@/components/officer/progress-chart";
import { RecentSalesList } from "@/components/officer/recent-sales-list";
import type { PayoutResult } from "@/lib/incentive-types";
import type { SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type OfficerDashboardData = {
  monthKey: string;
  cars: { id: string; name: string; imageUrl: string }[];
  slabs: SlabShape[];
  entries: { id: string; carName: string; carImageUrl: string; soldAt: string }[];
  totalUnits: number;
  payout: PayoutResult;
  chartSeries: { date: string; cumulativeUnits: number }[];
};

type OfficerDashboardClientProps = {
  initialData: OfficerDashboardData;
  initialMonthKey: string;
};

export function OfficerDashboardClient({ initialData, initialMonthKey }: OfficerDashboardClientProps) {
  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetch = useRef(true);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/dashboard?month=${monthKey}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData((await res.json()) as OfficerDashboardData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setRefreshing(false);
    }
  }, [monthKey]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      if (monthKey === initialMonthKey) return;
    }
    void loadDashboard();
  }, [monthKey, loadDashboard, initialMonthKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Studio dashboard"
        description="Track monthly progress. Log new sales from the Log sale page."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GlassMonthPicker value={monthKey} onChange={setMonthKey} className="!py-2 !text-sm" />
            <Link
              href="/officer/log-sale"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-400"
            >
              Log sale
            </Link>
          </div>
        }
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <div className={cn("space-y-6", refreshing && "opacity-80 transition-opacity")}>
        {refreshing ? <p className="text-xs text-muted">Updating…</p> : null}
        <MetricStrip payout={data.payout} />
        <ProgressChart data={data.chartSeries} monthKey={data.monthKey} totalUnits={data.totalUnits} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentSalesList entries={data.entries} />
          </div>
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <LiveTracker payout={data.payout} />
            {data.slabs.length > 0 ? (
              <TierLadder slabs={data.slabs} totalUnits={data.totalUnits} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
