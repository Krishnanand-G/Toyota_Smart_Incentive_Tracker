"use client";

import { GlassAlert, GlassMonthPicker, GlassSkeleton, PageHeader } from "@/components/glass";
import { CelebrationDialog, LiveTracker, TierLadder } from "@/components/incentive";
import { LogSaleModal } from "@/components/officer/log-sale-modal";
import { MetricStrip } from "@/components/officer/metric-strip";
import { RecentSalesList } from "@/components/officer/recent-sales-list";
import type { PayoutResult } from "@/lib/incentive-types";
import type { SlabShape } from "@/lib/incentive-types";
import { currentMonthKey } from "@/lib/date-picker-utils";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const ProgressChart = dynamic(
  () => import("@/components/officer/progress-chart").then((mod) => mod.ProgressChart),
  { loading: () => <GlassSkeleton className="h-64 w-full" /> },
);

type DashboardData = {
  monthKey: string;
  cars: { id: string; name: string; imageUrl: string }[];
  slabs: SlabShape[];
  entries: { id: string; carName: string; carImageUrl: string; soldAt: string }[];
  totalUnits: number;
  payout: PayoutResult;
  chartSeries: { date: string; cumulativeUnits: number }[];
};

export default function OfficerDashboardPage() {
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [saleSuccessOpen, setSaleSuccessOpen] = useState(false);
  const [tierCelebrationOpen, setTierCelebrationOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [tierMessage, setTierMessage] = useState({ title: "", message: "" });

  const loadDashboard = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/dashboard?month=${monthKey}`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData((await res.json()) as DashboardData);
      hasLoaded.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleSaleSuccess(result: {
    entry: { carName: string; soldAt: string };
    tierUnlocked: boolean;
    tierLabel: string | null;
    payout: { slabLabel: string; perUnitAmount: number; totalPayout: number };
  }) {
    const soldDate = new Date(result.entry.soldAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setSuccessMessage({
      title: "Sale logged",
      message: `Recorded ${result.entry.carName} sold on ${soldDate}.`,
    });
    setSaleSuccessOpen(true);

    if (result.tierUnlocked && result.tierLabel) {
      setTierMessage({
        title: `New tier: ${result.tierLabel}`,
        message: `You're now earning ₹${result.payout.perUnitAmount.toLocaleString()} per unit. Estimated payout: ₹${result.payout.totalPayout.toLocaleString()}.`,
      });
    } else {
      setTierMessage({ title: "", message: "" });
    }

    void loadDashboard();
  }

  function closeSaleSuccess() {
    setSaleSuccessOpen(false);
    if (tierMessage.title) {
      setTierCelebrationOpen(true);
    }
  }

  function closeTierCelebration() {
    setTierCelebrationOpen(false);
    setTierMessage({ title: "", message: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Studio dashboard"
        description="Track monthly progress and log individual car sales."
        actions={<GlassMonthPicker value={monthKey} onChange={setMonthKey} className="!py-2 !text-sm" />}
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      {loading && !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <GlassSkeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <GlassSkeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GlassSkeleton className="h-80 w-full lg:col-span-2" />
            <GlassSkeleton className="h-80 w-full" />
          </div>
        </div>
      ) : data ? (
        <div className={cn("space-y-6", refreshing && "opacity-80 transition-opacity")}>
          {refreshing ? <p className="text-xs text-muted">Updating…</p> : null}
          <MetricStrip payout={data.payout} />
          <ProgressChart data={data.chartSeries} monthKey={data.monthKey} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentSalesList
                entries={data.entries}
                onLogSale={() => setLogModalOpen(true)}
              />
            </div>
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <LiveTracker payout={data.payout} />
              {data.slabs.length > 0 ? (
                <TierLadder slabs={data.slabs} totalUnits={data.totalUnits} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {data ? (
        <LogSaleModal
          open={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          monthKey={monthKey}
          cars={data.cars}
          onSuccess={handleSaleSuccess}
        />
      ) : null}

      <CelebrationDialog
        open={saleSuccessOpen}
        title={successMessage.title}
        message={successMessage.message}
        confirmLabel="OK"
        onClose={closeSaleSuccess}
      />

      <CelebrationDialog
        open={tierCelebrationOpen}
        title={tierMessage.title}
        message={tierMessage.message}
        confirmLabel="Awesome"
        onClose={closeTierCelebration}
      />
    </div>
  );
}
