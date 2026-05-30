"use client";

import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type SaleEntryRow = {
  id: string;
  carName: string;
  carImageUrl: string;
  soldAt: string;
};

type RecentSalesListProps = {
  entries: SaleEntryRow[];
};

export function RecentSalesList({ entries }: RecentSalesListProps) {
  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent sales</h3>
          <p className="text-xs text-muted">Individual logs for this month</p>
        </div>
        <Link
          href="/officer/log-sale"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full bg-accent-blue px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90",
          )}
        >
          <Plus size={16} />
          Log sale
        </Link>
      </div>

      {!entries.length ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
          No sales logged yet.{" "}
          <Link href="/officer/log-sale" className="text-orange-400 hover:underline">
            Log your first sale
          </Link>
          .
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 dark-scrollbar">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-black/40 p-1">
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
                <p className="text-xs text-muted">
                  {new Date(entry.soldAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
