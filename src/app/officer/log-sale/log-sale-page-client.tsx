"use client";

import { LogSaleForm } from "@/components/officer/log-sale-form";
import { useSaleCelebration } from "@/components/officer/use-sale-celebration";
import { GlassAlert, GlassBadge, GlassCard, GlassMonthPicker, PageHeader } from "@/components/glass";
import type { CarModelOption, OfficerSaleEntryDisplay } from "@/lib/sale-types";
import type { PayoutResult } from "@/lib/incentive-types";
import { formatMonthDisplay, formatUtcDate } from "@/lib/date-picker-utils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type LogSalePageClientProps = {
  initialMonthKey: string;
  initialCars: CarModelOption[];
  initialEntries: OfficerSaleEntryDisplay[];
  initialPayout: PayoutResult;
  initialTotalUnits: number;
};

function MonthStatsCard({
  totalUnits,
  payout,
  className,
}: {
  totalUnits: number;
  payout: PayoutResult;
  className?: string;
}) {
  return (
    <GlassCard className={`border border-border p-4 ${className ?? ""}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">This month</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-2xl font-bold text-foreground">{totalUnits}</p>
          <p className="text-xs text-muted">units sold</p>
        </div>
        <div className="text-right">
          <GlassBadge variant="blue" className="max-w-full truncate">
            {payout.slabLabel}
          </GlassBadge>
          <p className="mt-1 text-xs text-muted">current tier</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm text-muted">Est. payout</span>
        <span className="font-mono text-lg font-semibold text-accent-primary">
          ₹{payout.totalPayout.toLocaleString()}
        </span>
      </div>
    </GlassCard>
  );
}

function LoggedEntriesCard({ entries }: { entries: OfficerSaleEntryDisplay[] }) {
  return (
    <GlassCard className="border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Logged this month</h3>
        <Link href="/officer/history" className="text-xs text-accent-primary hover:underline">
          Full history
        </Link>
      </div>
      {!entries.length ? (
        <p className="text-sm text-muted">No sales yet for this month.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-1 dark-scrollbar lg:max-h-64">
          {entries.slice(0, 8).map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-row py-2.5 pl-2 pr-3"
            >
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-background-muted p-0.5">
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
                <p className="truncate text-sm font-medium text-foreground">{entry.carName}</p>
                <p className="text-xs text-muted">{formatUtcDate(entry.soldAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

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
        actions={
          <GlassMonthPicker
            value={monthKey}
            onChange={setMonthKey}
            className="w-full !py-2.5 !text-sm lg:w-auto"
          />
        }
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <MonthStatsCard totalUnits={totalUnits} payout={payout} className="lg:hidden" />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
        <GlassCard className="order-2 border border-border p-4 sm:p-6 lg:order-1 lg:col-span-2">
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

        <div className="order-3 space-y-4 lg:order-2">
          <MonthStatsCard totalUnits={totalUnits} payout={payout} className="hidden lg:block" />
          <LoggedEntriesCard entries={entries} />
        </div>
      </div>

      {dialogs}
    </div>
  );
}
