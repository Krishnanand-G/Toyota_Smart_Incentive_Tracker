"use client";

import { GlassCard } from "@/components/glass";
import type { PayoutResult } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
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
    <GlassCard className="space-y-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Live engine</h3>
        <span className="hidden font-mono text-xs text-muted lg:inline">incentive.calc</span>
      </div>

      <div className="glass-section space-y-3 rounded-md p-4 font-mono text-sm">
        <div className="flex justify-between gap-3 text-muted">
          <span>total_units</span>
          <AnimatedValue value={String(payout.totalUnits)} />
        </div>
        <div className="flex justify-between gap-3 text-muted">
          <span>current_tier</span>
          <span
            className={cn(
              "text-right text-foreground",
              "max-lg:break-words max-lg:text-sm",
              "lg:max-w-[55%] lg:truncate",
            )}
          >
            <AnimatedValue value={payout.slabLabel} />
          </span>
        </div>
        <div className="flex justify-between gap-3 text-muted">
          <span>per_unit</span>
          <AnimatedValue value={payout.perUnitAmount.toLocaleString()} />
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted">total_payout</p>
          <p className="mt-1 text-2xl font-bold text-accent-primary sm:text-3xl">
            <AnimatedValue value={`₹${payout.totalPayout.toLocaleString()}`} />
          </p>
        </div>
      </div>

      {payout.nextTierDeltaUnits !== null ? (
        <p className="font-mono text-xs text-amber-700">
          → need {payout.nextTierDeltaUnits} more units for next tier
        </p>
      ) : (
        <p className="font-mono text-xs text-emerald-700">→ top tier reached</p>
      )}

      {submitted ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Month submitted — read only
        </p>
      ) : null}
    </GlassCard>
  );
}
