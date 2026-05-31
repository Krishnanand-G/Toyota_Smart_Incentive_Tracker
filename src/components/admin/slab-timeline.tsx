"use client";

import type { CSSProperties } from "react";
import type { SlabShape } from "@/lib/incentive-types";
import { TierUnitRange } from "@/components/incentive/tier-unit-range";
import { cn } from "@/lib/utils";

type SlabTimelineProps = {
  slabs: SlabShape[];
  activeIndex: number | null;
  onSelect: (index: number | null) => void;
};

const SEGMENT_COLORS = [
  "bg-red-100 border-red-200",
  "bg-red-50 border-red-100",
  "bg-gray-100 border-gray-200",
  "bg-gray-50 border-gray-100",
  "bg-emerald-50 border-emerald-100",
];

function tierWidth(slab: SlabShape, maxEnd: number): number {
  const end = slab.maxUnits ?? maxEnd;
  const span = Math.max(end - slab.minUnits + 1, 1);
  return span;
}

export function SlabTimeline({ slabs, activeIndex, onSelect }: SlabTimelineProps) {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  const maxEnd =
    ordered.reduce((max, slab) => Math.max(max, slab.maxUnits ?? slab.minUnits + 10), 0) + 5;
  const totalWidth = ordered.reduce((sum, slab) => sum + tierWidth(slab, maxEnd), 0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Tier timeline</p>
      <div className="grid grid-cols-2 gap-2 lg:flex lg:h-16 lg:gap-0 lg:overflow-hidden lg:rounded-md lg:border lg:border-border">
        {ordered.map((slab, index) => {
          const width = tierWidth(slab, maxEnd);
          const pct = (width / totalWidth) * 100;
          const max = slab.maxUnits;
          const isActive = activeIndex === index;
          const isOddLast =
            ordered.length % 2 === 1 && index === ordered.length - 1;

          return (
            <button
              key={slab.id ?? `${slab.minUnits}-${index}`}
              type="button"
              onClick={() => onSelect(isActive ? null : index)}
              style={{ "--tier-width": `${pct}%` } as CSSProperties}
              className={cn(
                "flex min-h-[4.75rem] flex-col items-center justify-center rounded-md border border-border px-2 py-2 transition",
                isOddLast && "col-span-2 lg:col-span-1",
                "lg:h-full lg:min-h-0 lg:w-[var(--tier-width)] lg:min-w-[60px] lg:shrink lg:rounded-none lg:border-r lg:border-y-0 lg:px-1 lg:last:border-r-0",
                SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                isActive && "ring-2 ring-accent-primary ring-inset",
              )}
            >
              <span className="truncate text-[10px] font-medium text-foreground">
                {slab.label ?? `Tier ${index + 1}`}
              </span>
              <TierUnitRange minUnits={slab.minUnits} maxUnits={max} />
              <span className="font-mono text-xs font-semibold text-accent-primary">
                ₹{Number(slab.perUnitAmount).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
