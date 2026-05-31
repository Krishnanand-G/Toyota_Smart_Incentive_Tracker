"use client";

import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";

import type { OfficerRank } from "@/lib/admin-dashboard-utils";

type OfficerLeaderboardProps = {
  data: OfficerRank[];
  /** Total units sold in the selected period (all officers). */
  totalUnits: number;
};

export function OfficerLeaderboard({ data, totalUnits }: OfficerLeaderboardProps) {
  const periodTotal = totalUnits > 0 ? totalUnits : 1;

  return (
    <GlassCard className="min-w-0 overflow-hidden p-3 sm:p-5">
      <div className="mb-3 lg:mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales officer leaderboard</h3>
        <p className="text-xs text-muted">Top performers by units sold</p>
      </div>

      {!data.length ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted lg:h-48">
          No sales officer activity yet.
        </div>
      ) : (
        <ul className="space-y-2.5 lg:space-y-3">
          {data.map((officer, index) => (
            <li key={officer.officerId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold lg:h-6 lg:w-6 lg:text-xs",
                      index === 0
                        ? "bg-red-50 text-accent-primary"
                        : "bg-surface-hover text-muted",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-foreground">{officer.officerName}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-foreground">{officer.units} units</p>
                  <p className="font-mono text-xs text-accent-primary">
                    ₹{officer.payout.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-background-muted">
                <div
                  className="h-full rounded-full bg-accent-primary transition-all"
                  style={{ width: `${(officer.units / periodTotal) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
