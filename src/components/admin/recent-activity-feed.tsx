"use client";

import { GlassCard } from "@/components/glass";
import { formatUtcDate } from "@/lib/date-picker-utils";

import type { RecentActivity } from "@/lib/admin-dashboard-utils";

type RecentActivityFeedProps = {
  data: RecentActivity[];
};

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
  return (
    <GlassCard className="min-w-0 overflow-hidden p-3 sm:p-5">
      <div className="mb-3 lg:mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
        <p className="text-xs text-muted">Latest sales across all sales officers</p>
      </div>

      {!data.length ? (
        <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted lg:h-32">
          No recent sales.
        </div>
      ) : (
        <ul className="max-h-64 min-w-0 space-y-2 overflow-x-hidden overflow-y-auto pr-1 lg:max-h-72">
          {data.map((item) => (
            <li
              key={item.id}
              className="flex min-w-0 items-start justify-between gap-2 overflow-hidden rounded-md border border-border bg-surface-row px-3 py-2 lg:items-center lg:gap-3 lg:py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.carName}</p>
                <p className="truncate text-xs text-muted">{item.officerName}</p>
              </div>
              <p className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-muted lg:pt-0">
                {formatUtcDate(item.soldAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
