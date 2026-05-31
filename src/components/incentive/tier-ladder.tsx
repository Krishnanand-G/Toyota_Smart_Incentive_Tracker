"use client";

import { GlassCard } from "@/components/glass";
import type { SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type TierLadderProps = {
  slabs: SlabShape[];
  totalUnits: number;
  bare?: boolean;
};

function formatRange(slab: SlabShape) {
  const max = slab.maxUnits === null ? "∞" : slab.maxUnits;
  return `${slab.minUnits}–${max} units`;
}

function isSlabActive(slab: SlabShape, totalUnits: number) {
  return totalUnits >= slab.minUnits && (slab.maxUnits === null || totalUnits <= slab.maxUnits);
}

export function TierLadder({ slabs, totalUnits, bare = false }: TierLadderProps) {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);

  const list = (
    <ul className="space-y-2">
        {ordered.map((slab, index) => {
          const label =
            slab.label ??
            `${slab.minUnits}-${slab.maxUnits === null ? "∞" : slab.maxUnits} units`;
          const isActive = isSlabActive(slab, totalUnits);

          return (
            <motion.li
              key={slab.id ?? `${slab.minUnits}-${index}`}
              className={cn(
                "relative rounded-lg border px-3 py-2.5 transition",
                isActive
                  ? "border-red-200 bg-red-50"
                  : "border-border bg-surface-row",
              )}
            >
              {isActive ? (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent-primary" />
              ) : null}
              <div className="flex flex-col gap-1 pl-1 sm:flex-row sm:items-center sm:justify-between lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium max-lg:break-words lg:truncate",
                      isActive ? "text-foreground" : "text-muted",
                    )}
                  >
                    {label}
                  </p>
                  <p className="font-mono text-xs text-muted">{formatRange(slab)}</p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold",
                    isActive ? "text-accent-primary" : "text-muted",
                  )}
                >
                  ₹{Number(slab.perUnitAmount).toLocaleString()}/u
                </p>
              </div>
            </motion.li>
          );
        })}
    </ul>
  );

  if (bare) {
    return <div className="space-y-2 p-2">{list}</div>;
  }

  return (
    <GlassCard className="space-y-3 p-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Tier ladder</h3>
      {list}
    </GlassCard>
  );
}
