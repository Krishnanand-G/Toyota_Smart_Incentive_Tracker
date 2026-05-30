"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { GlassBadge, GlassButton, GlassCard, GlassSkeleton } from "@/components/glass";
import type { OfficerSummary } from "@/components/admin/officer-list-item";
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
};

export function OfficerDetailPanel({
  officer,
  historyRows,
  historyLoading,
  onClose,
  onEdit,
}: OfficerDetailPanelProps) {
  if (!officer) {
    return (
      <GlassCard className="flex h-full min-h-[420px] flex-col items-center justify-center border border-dashed border-white/10 p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
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

  return (
    <GlassCard className="flex h-full min-h-[420px] flex-col border border-white/10">
      <div className="border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <OfficerAvatar
              fullName={officer.fullName}
              email={officer.email}
              photoUrl={officer.photoUrl}
              size="md"
              selected
            />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {officer.fullName || "Unnamed sales officer"}
              </h3>
              {officer.officerId ? (
                <p className="font-mono text-xs text-orange-400">{officer.officerId}</p>
              ) : null}
              <p className="text-sm text-muted">{officer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <GlassButton
              type="button"
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => onEdit(officer)}
            >
              <Pencil size={14} />
              Edit
            </GlassButton>
            <button
              type="button"
              onClick={onClose}
              className="glass-pill rounded-full p-1.5 text-muted transition hover:text-foreground lg:hidden"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Total sales</p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">{officer.totalSales}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">This month</p>
            <p className="mt-1 font-mono text-lg font-semibold text-orange-400">{officer.thisMonthSales}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Lifetime payout</p>
            <p className="mt-1 font-mono text-lg font-semibold text-orange-400">
              ₹{lifetimePayout.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
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
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted">
            No sales logged yet for this sales officer.
          </div>
        ) : null}

        {!historyLoading && historyRows.length > 0 ? (
          <div className="space-y-3">
            {historyRows.map((row) => (
              <motion.div key={row.id} whileHover={{ scale: 1.005 }} transition={{ duration: 0.15 }}>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
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
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                    <p className="font-mono text-sm text-muted">{row.totalUnits} units</p>
                    <p className="flex items-center gap-1 font-mono text-sm font-semibold text-orange-400">
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
    </GlassCard>
  );
}
