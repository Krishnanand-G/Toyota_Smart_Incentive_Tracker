"use client";

import type { SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";

type SlabTimelineProps = {
  slabs: SlabShape[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
};

const SEGMENT_COLORS = [
  "bg-orange-500/30 border-orange-500/40",
  "bg-amber-500/25 border-amber-500/35",
  "bg-yellow-500/20 border-yellow-500/30",
  "bg-lime-500/20 border-lime-500/30",
  "bg-emerald-500/20 border-emerald-500/30",
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
      <div className="flex h-16 overflow-hidden rounded-xl border border-white/10">
        {ordered.map((slab, index) => {
          const width = tierWidth(slab, maxEnd);
          const pct = (width / totalWidth) * 100;
          const max = slab.maxUnits === null ? "∞" : slab.maxUnits;
          const isActive = activeIndex === index;

          return (
            <button
              key={slab.id ?? `${slab.minUnits}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              style={{ width: `${pct}%` }}
              className={cn(
                "flex min-w-[60px] flex-col items-center justify-center border-r border-white/5 px-1 transition last:border-r-0",
                SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                isActive && "ring-2 ring-orange-400 ring-inset",
              )}
            >
              <span className="truncate text-[10px] font-medium text-foreground">
                {slab.label ?? `Tier ${index + 1}`}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {slab.minUnits}–{max}
              </span>
              <span className="font-mono text-xs font-semibold text-orange-400">
                ₹{Number(slab.perUnitAmount).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
