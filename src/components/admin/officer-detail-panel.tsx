"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { GlassBadge, GlassButton, GlassCard, GlassSkeleton } from "@/components/glass";
import type { OfficerSummary } from "@/lib/admin-types";
import { formatMonthDisplay } from "@/lib/date-picker-utils";
import { motion } from "framer-motion";
import { Calendar, IndianRupee, Pencil, User, X } from "lucide-react";

type HistoryRow = {
  id: string;
  monthKey: string;
  totalUnits: number;
  totalIncentive: number;
  slabLabel: string;
  entryCount: number;
};

type OfficerDetailPanelProps = {
  officer: OfficerSummary | null;
  historyRows: HistoryRow[];
  historyLoading: boolean;
  onClose: () => void;
  onEdit: (officer: OfficerSummary) => void;
  variant?: "default" | "sheet";
};

function DetailStats({
  officer,
  lifetimePayout,
}: {
  officer: OfficerSummary;
  lifetimePayout: number;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 lg:mt-4 lg:grid-cols-3">
      <div className="rounded-md border border-border bg-surface-row px-3 py-2 lg:rounded-xl lg:py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted">Total sales</p>
        <p className="mt-1 font-mono text-base font-semibold text-foreground lg:text-lg">{officer.totalSales}</p>
      </div>
      <div className="rounded-md border border-border bg-surface-row px-3 py-2 lg:rounded-xl lg:py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted">This month</p>
        <p className="mt-1 font-mono text-base font-semibold text-accent-primary lg:text-lg">
          {officer.thisMonthSales}
        </p>
      </div>
      <div className="col-span-2 rounded-md border border-border bg-surface-row px-3 py-2 lg:col-span-1 lg:rounded-xl lg:py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted">Lifetime payout</p>
        <p className="mt-1 font-mono text-base font-semibold text-accent-primary lg:text-lg">
          ₹{lifetimePayout.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function DetailHistory({
  historyRows,
  historyLoading,
  className,
}: {
  historyRows: HistoryRow[];
  historyLoading: boolean;
  className?: string;
}) {
  return (
    <div className={`min-h-0 flex-1 lg:overflow-y-auto ${className ?? ""}`}>
      <div className="mb-3 flex items-center gap-2">
        <Calendar size={14} className="text-muted" />
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted">Monthly history</h4>
      </div>

      {historyLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : null}

      {!historyLoading && !historyRows.length ? (
        <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted lg:rounded-xl lg:p-6">
          No sales logged yet for this sales officer.
        </div>
      ) : null}

      {!historyLoading && historyRows.length > 0 ? (
        <div className="space-y-2.5 lg:space-y-3">
          {historyRows.map((row) => (
            <motion.div key={row.id} whileHover={{ scale: 1.005 }} transition={{ duration: 0.15 }}>
              <div className="rounded-md border border-border bg-surface-row p-3 lg:rounded-xl lg:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 lg:gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {formatMonthDisplay(row.monthKey)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {row.entryCount} sale{row.entryCount === 1 ? "" : "s"} logged
                    </p>
                  </div>
                  <GlassBadge variant="blue">{row.slabLabel}</GlassBadge>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 lg:mt-3 lg:pt-3">
                  <p className="font-mono text-sm text-muted">{row.totalUnits} units</p>
                  <p className="flex items-center gap-1 font-mono text-sm font-semibold text-accent-primary">
                    <IndianRupee size={14} />
                    {Number(row.totalIncentive).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OfficerDetailPanel({
  officer,
  historyRows,
  historyLoading,
  onClose,
  onEdit,
  variant = "default",
}: OfficerDetailPanelProps) {
  const isSheet = variant === "sheet";

  if (!officer) {
    return (
      <GlassCard className="flex h-full min-h-[240px] flex-col items-center justify-center border border-dashed border-border p-8 text-center lg:min-h-[420px]">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-surface-hover">
          <User size={24} className="text-muted" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Select a sales officer</h3>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Choose a sales officer from the list to view their monthly sales history and payout breakdown.
        </p>
      </GlassCard>
    );
  }

  const lifetimePayout = historyRows.reduce((sum, row) => sum + Number(row.totalIncentive), 0);

  const header = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 lg:gap-3">
          <OfficerAvatar
            fullName={officer.fullName}
            email={officer.email}
            photoUrl={officer.photoUrl}
            size={isSheet ? "sm" : "md"}
            selected
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground lg:text-base">
              {officer.fullName || "Unnamed sales officer"}
            </h3>
            {officer.officerId ? (
              <p className="font-mono text-xs text-accent-primary">{officer.officerId}</p>
            ) : null}
            <p className="truncate text-xs text-muted lg:text-sm">{officer.email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <GlassButton
            type="button"
            variant="secondary"
            className="!px-3 !py-1.5 !text-xs"
            onClick={() => onEdit(officer)}
          >
            <Pencil size={14} />
            Edit
          </GlassButton>
          {!isSheet ? (
            <button
              type="button"
              onClick={onClose}
              className="glass-pill rounded-full p-1.5 text-muted transition hover:text-foreground lg:hidden"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
      <DetailStats officer={officer} lifetimePayout={lifetimePayout} />
    </>
  );

  if (isSheet) {
    return (
      <div className="flex flex-col">
        <div className="border-b border-border pb-3">{header}</div>
        <DetailHistory
          historyRows={historyRows}
          historyLoading={historyLoading}
        />
      </div>
    );
  }

  return (
    <GlassCard className="flex h-full min-h-[240px] flex-col border border-border lg:min-h-[420px]">
      <div className="border-b border-border p-4 sm:p-5">{header}</div>
      <DetailHistory
        historyRows={historyRows}
        historyLoading={historyLoading}
        className="p-4 sm:p-5"
      />
    </GlassCard>
  );
}
