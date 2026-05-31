"use client";

import { GlassCard } from "@/components/glass";
import { calculateIncentive } from "@/lib/incentive";
import type { SlabShape } from "@/lib/incentive-types";

type SlabScrubberProps = {
  slabs: SlabShape[];
  units: number;
  onUnitsChange: (units: number) => void;
};

function computeMaxUnits(slabs: SlabShape[]): number {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  const last = ordered.at(-1);
  if (!last) return 50;
  return Math.max((last.maxUnits ?? last.minUnits + 20) + 5, 50);
}

export function SlabScrubber({ slabs, units, onUnitsChange }: SlabScrubberProps) {
  const maxUnits = computeMaxUnits(slabs);
  const payout = calculateIncentive(units, slabs);

  return (
    <GlassCard className="space-y-3 p-3 lg:space-y-4 lg:p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">What-if simulator</h3>
        <p className="text-xs text-muted">Drag to preview payout at any unit count</p>
      </div>

      <div className="space-y-1.5 lg:space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Units sold</span>
          <span className="font-mono font-semibold text-foreground">{units}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxUnits}
          value={units}
          onChange={(e) => onUnitsChange(Number(e.target.value))}
          className="w-full accent-[#EB0A1E]"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted">
          <span>0</span>
          <span>{maxUnits}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface-row p-3">
        <div>
          <p className="text-xs text-muted">Active tier</p>
          <p className="text-sm font-semibold text-foreground">{payout.slabLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Per unit</p>
          <p className="font-mono text-sm font-semibold text-accent-primary">
            ₹{payout.perUnitAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Total payout</p>
          <p className="font-mono text-sm font-bold text-accent-primary">
            ₹{payout.totalPayout.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">To next tier</p>
          <p className="text-sm font-semibold text-foreground">
            {payout.nextTierDeltaUnits !== null
              ? `${payout.nextTierDeltaUnits} units`
              : "Top tier"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
