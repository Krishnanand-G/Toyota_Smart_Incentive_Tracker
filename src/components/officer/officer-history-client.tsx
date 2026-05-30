"use client";

import { GlassAlert, GlassBadge, GlassCard, GlassSkeleton, PageHeader } from "@/components/glass";
import { formatMonthDisplay, formatUtcDate } from "@/lib/date-picker-utils";
import { cn } from "@/lib/utils";
import { ChevronDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HistoryEntry = {
  id: string;
  carName: string;
  carImageUrl: string;
  soldAt: string;
};

type HistoryMonth = {
  id: string;
  monthKey: string;
  totalUnits: number;
  totalIncentive: number;
  slabLabel: string;
  perUnitAmount: number;
  entryCount: number;
  entries: HistoryEntry[];
};

export function OfficerHistoryClient() {
  const [months, setMonths] = useState<HistoryMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("Failed to load history");
        const data = (await res.json()) as HistoryMonth[];
        setMonths(data);
        setExpandedMonth(data[0]?.monthKey ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totals = useMemo(() => {
    const allUnits = months.reduce((sum, m) => sum + m.totalUnits, 0);
    const allPayout = months.reduce((sum, m) => sum + m.totalIncentive, 0);
    return { allUnits, allPayout, monthCount: months.length };
  }, [months]);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="History"
        description="Your past months at a glance — expand any month to see each sale."
        actions={
          <Link
            href="/officer/log-sale"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-400"
          >
            Log a sale
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : null}

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      {!loading && !error && months.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GlassCard className="border border-white/10 p-4">
            <p className="text-xs text-muted">All-time units</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">{totals.allUnits}</p>
          </GlassCard>
          <GlassCard className="border border-white/10 p-4">
            <p className="text-xs text-muted">Months tracked</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">{totals.monthCount}</p>
          </GlassCard>
          <GlassCard className="border border-white/10 p-4">
            <p className="text-xs text-muted">Lifetime est. payout</p>
            <p className="mt-1 font-mono text-2xl font-bold text-orange-400">
              ₹{totals.allPayout.toLocaleString()}
            </p>
          </GlassCard>
        </div>
      ) : null}

      {!loading && !months.length && !error ? (
        <GlassCard className="space-y-4 border border-white/10 p-8 text-center">
          <TrendingUp className="mx-auto text-muted" size={32} />
          <div>
            <p className="text-sm font-medium text-foreground">No sales history yet</p>
            <p className="mt-1 text-sm text-muted">Log your first sale to start building monthly records.</p>
          </div>
          <Link
            href="/officer/log-sale"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-400"
          >
            Log a sale
          </Link>
        </GlassCard>
      ) : null}

      <div className="space-y-3">
        {months.map((month) => {
          const open = expandedMonth === month.monthKey;
          return (
            <GlassCard key={month.id} className="overflow-hidden border border-white/10">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 p-4 text-left transition hover:bg-white/[0.02]"
                onClick={() => setExpandedMonth(open ? null : month.monthKey)}
                aria-expanded={open}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground">{formatMonthDisplay(month.monthKey)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {month.entryCount} sale{month.entryCount === 1 ? "" : "s"} · ₹
                    {month.perUnitAmount.toLocaleString()}/unit tier
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <GlassBadge variant="blue">{month.slabLabel}</GlassBadge>
                  <span className="font-mono text-sm text-muted">{month.totalUnits} units</span>
                  <span className="font-mono text-sm font-semibold text-orange-400">
                    ₹{Number(month.totalIncentive).toLocaleString()}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn("text-muted transition", open && "rotate-180")}
                  />
                </div>
              </button>

              {open ? (
                <ul
                  className={cn(
                    "space-y-2 border-t border-white/10 px-4 py-3",
                    month.entries.length > 0 &&
                      "max-h-[min(22rem,55vh)] overflow-y-auto pr-2 dark-scrollbar",
                  )}
                >
                  {month.entries.length === 0 ? (
                    <li className="text-sm text-muted">No individual entries found.</li>
                  ) : (
                    month.entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-black/40 p-1">
                          <Image
                            src={entry.carImageUrl}
                            alt={entry.carName}
                            width={64}
                            height={48}
                            unoptimized
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{entry.carName}</p>
                          <p className="text-xs text-muted">{formatUtcDate(entry.soldAt, { style: "long" })}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
