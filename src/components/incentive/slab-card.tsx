"use client";

import { GlassButton, GlassCard, GlassInput } from "@/components/glass";
import type { SlabShape } from "@/lib/incentive-types";
import { Trash2 } from "lucide-react";

export type SlabCardProps = {
  slab: SlabShape;
  index: number;
  onChange: (index: number, field: keyof SlabShape, value: string | number | null) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
};

export function SlabCard({ slab, index, onChange, onRemove, canRemove }: SlabCardProps) {
  return (
    <GlassCard className="space-y-3 border border-white/10 p-4 transition hover:border-white/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Tier {index + 1}</p>
        {canRemove ? (
          <GlassButton
            type="button"
            variant="ghost"
            className="!p-2"
            onClick={() => onRemove(index)}
            aria-label="Remove tier"
          >
            <Trash2 size={16} className="text-red-400" />
          </GlassButton>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted">Label</span>
          <GlassInput
            value={slab.label ?? ""}
            onChange={(e) => onChange(index, "label", e.target.value)}
            placeholder="Starter"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">Per unit (₹)</span>
          <GlassInput
            type="number"
            min={0}
            value={Number(slab.perUnitAmount)}
            onChange={(e) => onChange(index, "perUnitAmount", Number(e.target.value))}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">Min units</span>
          <GlassInput
            type="number"
            min={0}
            value={slab.minUnits}
            onChange={(e) => onChange(index, "minUnits", Number(e.target.value))}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">Max units (empty = ∞)</span>
          <GlassInput
            type="number"
            min={0}
            value={slab.maxUnits ?? ""}
            onChange={(e) =>
              onChange(index, "maxUnits", e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="∞"
          />
        </label>
      </div>
    </GlassCard>
  );
}
