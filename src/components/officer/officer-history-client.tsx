"use client";

import { EditSaleEntryModal } from "@/components/officer/edit-sale-entry-modal";
import type { CarModelOption, EditableSaleEntry } from "@/lib/sale-types";
import type { OfficerHistoryMonth } from "@/lib/officer-history-data";
import { GlassAlert, GlassButton, GlassCard, PageHeader } from "@/components/glass";
import { formatMonthDisplay, formatMonthDisplayLong, formatUtcDate } from "@/lib/date-picker-utils";
import { cn } from "@/lib/utils";
import { ChevronDown, Pencil, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type OfficerHistoryClientProps = {
  initialMonths: OfficerHistoryMonth[];
  initialCars: CarModelOption[];
  currentMonthKey: string;
};

function HistorySummaryCard({
  label,
  value,
  accent,
  wideOnMobile,
}: {
  label: string;
  value: string;
  accent?: boolean;
  wideOnMobile?: boolean;
}) {
  return (
    <GlassCard
      className={cn(
        "border border-border p-3 lg:p-4",
        wideOnMobile && "col-span-2 lg:col-span-1",
      )}
    >
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums leading-snug lg:text-2xl",
          accent ? "text-accent-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </GlassCard>
  );
}

export function OfficerHistoryClient({
  initialMonths,
  initialCars,
  currentMonthKey,
}: OfficerHistoryClientProps) {
  const [months, setMonths] = useState<OfficerHistoryMonth[]>(initialMonths);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(() =>
    initialMonths.some((month) => month.monthKey === currentMonthKey) ? currentMonthKey : null,
  );
  const [editingEntry, setEditingEntry] = useState<EditableSaleEntry | null>(null);

  const reloadHistory = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load history");
      setMonths((await res.json()) as OfficerHistoryMonth[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const totals = useMemo(() => {
    const allUnits = months.reduce((sum, m) => sum + m.totalUnits, 0);
    const allPayout = months.reduce((sum, m) => sum + m.totalIncentive, 0);
    return { allUnits, allPayout, monthCount: months.length };
  }, [months]);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        badge="History"
        description="Review past months. Sales from the current month can be edited here."
        actions={
          <Link
            href="/officer/log-sale"
            className="officer-touch inline-flex w-full items-center justify-center rounded-md bg-accent-primary px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-[var(--accent-primary-hover)] sm:w-auto lg:py-2 lg:text-xs"
          >
            Log a sale
          </Link>
        }
      />

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      {!error && months.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
          <HistorySummaryCard label="All-time units" value={String(totals.allUnits)} />
          <HistorySummaryCard label="Months tracked" value={String(totals.monthCount)} />
          <HistorySummaryCard
            label="Lifetime est. payout"
            value={`₹${totals.allPayout.toLocaleString()}`}
            accent
            wideOnMobile
          />
        </div>
      ) : null}

      {!months.length && !error ? (
        <GlassCard className="space-y-4 p-8 text-center">
          <TrendingUp className="mx-auto text-muted" size={32} />
          <div>
            <p className="text-sm font-medium text-foreground">No sales history yet</p>
            <p className="mt-1 text-sm text-muted">Log your first sale to start building monthly records.</p>
          </div>
          <Link
            href="/officer/log-sale"
            className="officer-touch inline-flex items-center justify-center rounded-md bg-accent-primary px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-[var(--accent-primary-hover)]"
          >
            Log a sale
          </Link>
        </GlassCard>
      ) : null}

      {months.length > 0 ? (
        <div className="space-y-2.5 lg:space-y-3">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Monthly records</h3>
            <p className="text-xs text-muted lg:hidden">Tap to expand</p>
          </div>

          {months.map((month) => {
            const open = expandedMonth === month.monthKey;
            const isCurrentMonth = month.monthKey === currentMonthKey;
            const saleLabel = `${month.entryCount} sale${month.entryCount === 1 ? "" : "s"}`;

            return (
              <GlassCard
                key={month.id}
                className={cn(
                  "overflow-hidden border transition",
                  open && "border-red-200 ring-1 ring-red-100",
                  isCurrentMonth && !open && "border-l-[3px] border-l-emerald-500",
                )}
              >
                <button
                  type="button"
                  className="w-full touch-manipulation px-3 py-3 text-left transition hover:bg-surface-row lg:px-4 lg:py-4"
                  onClick={() => setExpandedMonth(open ? null : month.monthKey)}
                  aria-expanded={open}
                >
                  {/* Mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-base font-semibold leading-tight text-foreground">
                            {formatMonthDisplayLong(month.monthKey)}
                          </p>
                          {isCurrentMonth ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              Current
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {saleLabel} · {month.slabLabel} · ₹
                          {month.perUnitAmount.toLocaleString()}/unit
                          {refreshing && isCurrentMonth ? " · updating…" : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wide text-muted">Payout</p>
                          <p className="text-base font-semibold tabular-nums text-accent-primary">
                            ₹{Number(month.totalIncentive).toLocaleString()}
                          </p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cn("shrink-0 text-muted transition", open && "rotate-180")}
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between rounded-md bg-surface-row px-2.5 py-2 text-xs">
                      <span className="font-medium text-foreground">{month.totalUnits} units sold</span>
                      <span className="text-muted">{month.slabLabel} tier</span>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden lg:block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">
                            {formatMonthDisplay(month.monthKey)}
                          </p>
                          {isCurrentMonth ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              Current month
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {saleLabel} · ₹{month.perUnitAmount.toLocaleString()}/unit · {month.slabLabel}
                          {refreshing && isCurrentMonth ? " · updating…" : null}
                        </p>
                      </div>
                      <ChevronDown
                        size={20}
                        className={cn("mt-0.5 shrink-0 text-muted transition", open && "rotate-180")}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-accent-primary">
                        {month.slabLabel}
                      </span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="tabular-nums text-muted">{month.totalUnits} units</span>
                        <span className="tabular-nums font-semibold text-accent-primary">
                          ₹{Number(month.totalIncentive).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {open ? (
                  <ul
                    className={cn(
                      "space-y-2 border-t border-border px-3 py-3 lg:px-4",
                      month.entries.length > 0 &&
                        "max-h-[min(22rem,55vh)] overflow-y-auto pr-1 dark-scrollbar",
                    )}
                  >
                    {month.entries.length === 0 ? (
                      <li className="text-sm text-muted">No individual entries found.</li>
                    ) : (
                      month.entries.map((entry) => {
                        const canEdit = isCurrentMonth;

                        return (
                          <li
                            key={entry.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-surface-row p-2.5 lg:border-0 lg:p-3"
                          >
                            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-md bg-background-muted p-1 lg:h-12 lg:w-16">
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
                              <p className="truncate text-sm font-medium text-foreground">
                                {entry.carName}
                              </p>
                              <p className="text-xs text-muted">{formatUtcDate(entry.soldAt)}</p>
                            </div>
                            {canEdit ? (
                              <GlassButton
                                type="button"
                                variant="ghost"
                                className="!min-h-[44px] !min-w-[44px] !px-2 !py-1.5"
                                onClick={() =>
                                  setEditingEntry({
                                    id: entry.id,
                                    carModelId: entry.carModelId,
                                    carName: entry.carName,
                                    soldAt: entry.soldAt,
                                  })
                                }
                                aria-label={`Edit sale for ${entry.carName}`}
                              >
                                <Pencil size={16} />
                              </GlassButton>
                            ) : null}
                          </li>
                        );
                      })
                    )}
                  </ul>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      ) : null}

      <EditSaleEntryModal
        open={editingEntry !== null}
        entry={editingEntry}
        cars={initialCars}
        monthKey={currentMonthKey}
        onClose={() => setEditingEntry(null)}
        onSaved={() => void reloadHistory()}
      />
    </div>
  );
}
