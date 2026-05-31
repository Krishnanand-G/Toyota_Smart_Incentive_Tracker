"use client";

import { GlassAlert, GlassCard, GlassMonthPicker, PageHeader } from "@/components/glass";
import { LiveTracker } from "@/components/incentive/live-tracker";
import { TierLadder } from "@/components/incentive/tier-ladder";
import type { SlabShape } from "@/lib/incentive-types";
import { MetricStrip } from "@/components/officer/metric-strip";
import { ProgressChart } from "@/components/officer/progress-chart";
import { RecentSalesList } from "@/components/officer/recent-sales-list";
import type { PayoutResult } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
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

function CollapsibleTierLadder({
  slabs,
  totalUnits,
}: {
  slabs: SlabShape[];
  totalUnits: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard className="overflow-hidden lg:hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tier ladder</h3>
          <p className="text-xs text-muted">Incentive slabs for this month</p>
        </div>
        <ChevronDown
          size={20}
          className={cn("shrink-0 text-muted transition", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="border-t border-border px-2 pb-2">
          <TierLadder slabs={slabs} totalUnits={totalUnits} bare />
        </div>
      ) : null}
    </GlassCard>
  );
}

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
          <div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center">
            <GlassMonthPicker
              value={monthKey}
              onChange={setMonthKey}
              className="w-full !py-2.5 !text-sm lg:w-auto"
            />
            <Link
              href="/officer/log-sale"
              className="officer-touch inline-flex w-full items-center justify-center rounded-md bg-accent-primary px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-[var(--accent-primary-hover)] lg:w-auto lg:py-2 lg:text-xs"
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

        <div className="lg:hidden">
          <LiveTracker payout={data.payout} />
        </div>

        <ProgressChart data={data.chartSeries} monthKey={data.monthKey} totalUnits={data.totalUnits} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentSalesList entries={data.entries} />
          </div>
          <div className="hidden space-y-4 lg:sticky lg:top-4 lg:block lg:self-start">
            <LiveTracker payout={data.payout} />
            {data.slabs.length > 0 ? (
              <TierLadder slabs={data.slabs} totalUnits={data.totalUnits} />
            ) : null}
          </div>
        </div>

        {data.slabs.length > 0 ? (
          <CollapsibleTierLadder slabs={data.slabs} totalUnits={data.totalUnits} />
        ) : null}
      </div>
    </div>
  );
}
