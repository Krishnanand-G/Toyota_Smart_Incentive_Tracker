"use client";

import { GlassCard } from "@/components/glass";
import type { SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type TierLadderProps = {
  slabs: SlabShape[];
  totalUnits: number;
};

function formatRange(slab: SlabShape) {
  const max = slab.maxUnits === null ? "∞" : slab.maxUnits;
  return `${slab.minUnits}–${max} units`;
}

function isSlabActive(slab: SlabShape, totalUnits: number) {
  return totalUnits >= slab.minUnits && (slab.maxUnits === null || totalUnits <= slab.maxUnits);
}

export function TierLadder({ slabs, totalUnits }: TierLadderProps) {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);

  return (
    <GlassCard className="space-y-3 p-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Tier ladder</h3>
      <ul className="space-y-2">
        {ordered.map((slab, index) => {
          const label =
            slab.label ??
            `${slab.minUnits}-${slab.maxUnits === null ? "∞" : slab.maxUnits} units`;
          const isActive = isSlabActive(slab, totalUnits);

          return (
            <motion.li
              key={slab.id ?? `${slab.minUnits}-${index}`}
              layout
              className={cn(
                "relative rounded-lg border px-3 py-2.5 transition",
                isActive
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-white/5 bg-white/[0.02]",
              )}
            >
              {isActive ? (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-orange-500" />
              ) : null}
              <div className="flex items-center justify-between gap-2 pl-1">
                <div>
                  <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted")}>
                    {label}
                  </p>
                  <p className="font-mono text-xs text-muted">{formatRange(slab)}</p>
                </div>
                <p className={cn("font-mono text-sm font-semibold", isActive ? "text-orange-400" : "text-muted")}>
                  ₹{Number(slab.perUnitAmount).toLocaleString()}/u
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
