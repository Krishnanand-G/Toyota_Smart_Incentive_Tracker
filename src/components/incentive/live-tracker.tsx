"use client";

import { GlassCard } from "@/components/glass";
import type { PayoutResult } from "@/lib/incentive-types";
import { AnimatePresence, motion } from "framer-motion";

export type LiveTrackerProps = {
  payout: PayoutResult;
  submitted?: boolean;
};

function AnimatedValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="font-mono"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function LiveTracker({ payout, submitted }: LiveTrackerProps) {
  return (
    <GlassCard className="space-y-4 border border-white/10 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Live engine</h3>
        <span className="font-mono text-[10px] text-muted">incentive.calc</span>
      </div>

      <div className="glass-section space-y-3 rounded-xl p-4 font-mono text-sm">
        <div className="flex justify-between text-muted">
          <span>total_units</span>
          <AnimatedValue value={String(payout.totalUnits)} />
        </div>
        <div className="flex justify-between text-muted">
          <span>current_tier</span>
          <span className="max-w-[55%] truncate text-right text-foreground">
            <AnimatedValue value={payout.slabLabel} />
          </span>
        </div>
        <div className="flex justify-between text-muted">
          <span>per_unit</span>
          <AnimatedValue value={payout.perUnitAmount.toLocaleString()} />
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-muted">total_payout</p>
          <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            <AnimatedValue value={`₹${payout.totalPayout.toLocaleString()}`} />
          </p>
        </div>
      </div>

      {payout.nextTierDeltaUnits !== null ? (
        <p className="font-mono text-xs text-amber-400">
          → need {payout.nextTierDeltaUnits} more units for next tier
        </p>
      ) : (
        <p className="font-mono text-xs text-emerald-400">→ top tier reached</p>
      )}

      {submitted ? (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          Month submitted — read only
        </p>
      ) : null}
    </GlassCard>
  );
}
