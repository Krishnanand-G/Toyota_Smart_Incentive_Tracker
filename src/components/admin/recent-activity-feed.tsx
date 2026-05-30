"use client";

import { GlassCard } from "@/components/glass";

type RecentActivity = {
  id: string;
  officerName: string;
  carName: string;
  soldAt: string;
};

type RecentActivityFeedProps = {
  data: RecentActivity[];
};

function formatSoldAt(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
  return (
    <GlassCard className="border border-white/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
        <p className="text-xs text-muted">Latest sales across all sales officers</p>
      </div>

      {!data.length ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted">
          No recent sales.
        </div>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {data.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.carName}</p>
                <p className="truncate text-xs text-muted">{item.officerName}</p>
              </div>
              <p className="shrink-0 text-xs text-muted">{formatSoldAt(item.soldAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
