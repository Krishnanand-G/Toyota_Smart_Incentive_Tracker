"use client";

import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";

type OfficerRank = {
  officerId: string;
  officerName: string;
  units: number;
  payout: number;
};

type OfficerLeaderboardProps = {
  data: OfficerRank[];
};

export function OfficerLeaderboard({ data }: OfficerLeaderboardProps) {
  const maxUnits = data[0]?.units ?? 1;

  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sales officer leaderboard</h3>
        <p className="text-xs text-muted">Top performers by units sold</p>
      </div>

      {!data.length ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted">
          No sales officer activity yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((officer, index) => (
            <li key={officer.officerId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index === 0
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-white/5 text-muted",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-foreground">{officer.officerName}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-foreground">{officer.units} units</p>
                  <p className="font-mono text-xs text-orange-400">
                    ₹{officer.payout.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${(officer.units / maxUnits) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
