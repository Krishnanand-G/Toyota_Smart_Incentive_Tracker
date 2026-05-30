"use client";

import { LogSaleForm } from "@/components/officer/log-sale-form";
import { useSaleCelebration } from "@/components/officer/use-sale-celebration";
import { GlassAlert, GlassBadge, GlassCard, GlassMonthPicker, PageHeader } from "@/components/glass";
import type { CarModelOption } from "@/components/officer/car-model-picker";
import type { PayoutResult } from "@/lib/incentive-types";
import { formatMonthDisplay } from "@/lib/date-picker-utils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type SaleEntryRow = {
  id: string;
  carName: string;
  carImageUrl: string;
  soldAt: string;
};

type LogSalePageClientProps = {
  initialMonthKey: string;
  initialCars: CarModelOption[];
  initialEntries: SaleEntryRow[];
  initialPayout: PayoutResult;
  initialTotalUnits: number;
};

export function LogSalePageClient({
  initialMonthKey,
  initialCars,
  initialEntries,
  initialPayout,
  initialTotalUnits,
}: LogSalePageClientProps) {
  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [cars, setCars] = useState(initialCars);
  const [entries, setEntries] = useState(initialEntries);
  const [payout, setPayout] = useState(initialPayout);
  const [totalUnits, setTotalUnits] = useState(initialTotalUnits);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetch = useRef(true);
  const { handleSaleSuccess, dialogs } = useSaleCelebration();

  const refreshMonth = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/dashboard?month=${monthKey}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load month data");
      const data = await res.json();
      setCars(data.cars);
      setEntries(data.entries);
      setPayout(data.payout);
      setTotalUnits(data.totalUnits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load month data");
    } finally {
      setRefreshing(false);
    }
  }, [monthKey]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      if (monthKey === initialMonthKey) return;
    }
    void refreshMonth();
  }, [monthKey, refreshMonth, initialMonthKey]);

  async function onSaleLogged(result: Parameters<typeof handleSaleSuccess>[0]) {
    handleSaleSuccess(result);
    await refreshMonth();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Log sale"
        badgeVariant="amber"
        description="Record a unit sold this month. Pick the car, set the date, and submit."
        actions={<GlassMonthPicker value={monthKey} onChange={setMonthKey} className="!py-2 !text-sm" />}
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="border border-white/10 p-4 sm:p-6 lg:col-span-2">
          <p className="mb-4 text-xs text-muted">
            Logging for <span className="font-medium text-foreground">{formatMonthDisplay(monthKey)}</span>
            {refreshing ? " · updating…" : null}
          </p>
          <LogSaleForm
            key={monthKey}
            monthKey={monthKey}
            cars={cars}
            onSuccess={onSaleLogged}
            submitLabel="Log this sale"
          />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="border border-white/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">This month</p>
            <p className="mt-2 font-mono text-3xl font-bold text-foreground">{totalUnits}</p>
            <p className="text-sm text-muted">units sold</p>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted">Current tier</span>
                <GlassBadge variant="blue">{payout.slabLabel}</GlassBadge>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted">Est. payout</span>
                <span className="font-mono font-semibold text-orange-400">
                  ₹{payout.totalPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Logged this month</h3>
              <Link href="/officer/history" className="text-xs text-orange-400 hover:underline">
                Full history
              </Link>
            </div>
            {!entries.length ? (
              <p className="text-sm text-muted">No sales yet for this month.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 dark-scrollbar">
                {entries.slice(0, 8).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2"
                  >
                    <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-black/40 p-0.5">
                      <Image
                        src={entry.carImageUrl}
                        alt={entry.carName}
                        width={56}
                        height={40}
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{entry.carName}</p>
                      <p className="text-[11px] text-muted">
                        {new Date(entry.soldAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>

      {dialogs}
    </div>
  );
}
