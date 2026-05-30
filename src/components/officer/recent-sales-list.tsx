"use client";

import { GlassButton, GlassCard } from "@/components/glass";
import { Plus } from "lucide-react";
import Image from "next/image";

export type SaleEntryRow = {
  id: string;
  carName: string;
  carImageUrl: string;
  soldAt: string;
};

type RecentSalesListProps = {
  entries: SaleEntryRow[];
  onLogSale: () => void;
};

export function RecentSalesList({ entries, onLogSale }: RecentSalesListProps) {
  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent sales</h3>
          <p className="text-xs text-muted">Individual logs for this month</p>
        </div>
        <GlassButton type="button" variant="accent" onClick={onLogSale} className="!py-2">
          <Plus size={16} />
          Log sale
        </GlassButton>
      </div>

      {!entries.length ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
          No sales logged yet. Tap Log sale to record your first unit.
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 dark-scrollbar">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <Image
                src={entry.carImageUrl}
                alt={entry.carName}
                width={80}
                height={48}
                className="h-12 w-16 rounded-lg object-cover"
              />
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
