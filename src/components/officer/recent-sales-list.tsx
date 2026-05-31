"use client";

import { GlassCard } from "@/components/glass";
import { formatUtcDate } from "@/lib/date-picker-utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { OfficerSaleEntryDisplay } from "@/lib/sale-types";

type RecentSalesListProps = {
  entries: OfficerSaleEntryDisplay[];
};

export function RecentSalesList({ entries }: RecentSalesListProps) {
  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 max-lg:gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent sales</h3>
          <p className="text-xs text-muted">Individual logs for this month</p>
        </div>
        <Link
          href="/officer/log-sale"
          className="officer-touch inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-[var(--accent-primary-hover)] lg:w-auto lg:py-2 lg:text-xs"
        >
          <Plus size={16} />
          Log sale
        </Link>
      </div>

      {!entries.length ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No sales logged yet.{" "}
          <Link href="/officer/log-sale" className="text-accent-primary hover:underline">
            Log your first sale
          </Link>
          .
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 dark-scrollbar">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 rounded-md surface-row p-3">
              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-background-muted p-1">
                <Image
                  src={entry.carImageUrl}
                  alt={entry.carName}
                  width={80}
                  height={48}
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
