"use client";

import type { MouseEvent } from "react";
import { GlassButton, GlassCard, GlassInput } from "@/components/glass";
import { TierUnitRange } from "@/components/incentive/tier-unit-range";
import type { SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export type SlabCardProps = {
  slab: SlabShape;
  index: number;
  onChange: (index: number, field: keyof SlabShape, value: string | number | null) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  canRemove: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
};

export function SlabCard({
  slab,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
  canMoveUp = false,
  canMoveDown = false,
  collapsible = false,
  expanded = true,
  onToggle,
}: SlabCardProps) {
  const maxLabel = slab.maxUnits;
  const isCollapsed = collapsible && !expanded;

  function handleToggle(event: MouseEvent) {
    event.stopPropagation();
    onToggle?.();
  }

  return (
    <GlassCard className={cn("transition hover:border-accent-primary", isCollapsed ? "p-3" : "space-y-3 p-3 lg:p-4")}>
      <div className="flex items-center justify-between gap-2">
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleToggle}
            className="min-w-0 flex-1 touch-manipulation text-left"
            aria-expanded={expanded}
          >
            <p className="truncate text-sm font-semibold text-foreground">
              {slab.label ?? `Tier ${index + 1}`}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted">
              <TierUnitRange minUnits={slab.minUnits} maxUnits={maxLabel} size="sm" />
              <span>units · ₹{Number(slab.perUnitAmount).toLocaleString()}/u</span>
            </p>
          </button>
        ) : collapsible ? (
          <button
            type="button"
            onClick={handleToggle}
            className="min-w-0 flex-1 touch-manipulation text-left lg:pointer-events-none"
            aria-expanded={expanded}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Tier {index + 1}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {slab.label ?? `Tier ${index + 1}`}
            </p>
          </button>
        ) : (
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Tier {index + 1}</p>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {collapsible ? (
            <GlassButton
              type="button"
              variant="ghost"
              className="!p-2 touch-manipulation lg:hidden"
              onClick={handleToggle}
              aria-label={expanded ? "Collapse tier" : "Expand tier"}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </GlassButton>
          ) : null}
          {!isCollapsed && onMoveUp ? (
            <GlassButton
              type="button"
              variant="ghost"
              className="!hidden !p-2 lg:!inline-flex"
              onClick={() => onMoveUp(index)}
              disabled={!canMoveUp}
              aria-label="Move tier up"
            >
              <ChevronUp size={16} />
            </GlassButton>
          ) : null}
          {!isCollapsed && onMoveDown ? (
            <GlassButton
              type="button"
              variant="ghost"
              className="!hidden !p-2 lg:!inline-flex"
              onClick={() => onMoveDown(index)}
              disabled={!canMoveDown}
              aria-label="Move tier down"
            >
              <ChevronDown size={16} />
            </GlassButton>
          ) : null}
          {canRemove ? (
            <GlassButton
              type="button"
              variant="ghost"
              className="!p-2"
              onClick={() => onRemove(index)}
              aria-label="Remove tier"
            >
              <Trash2 size={16} className="text-red-600" />
            </GlassButton>
          ) : null}
        </div>
      </div>
      {!isCollapsed ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs text-muted">Label</span>
            <GlassInput
              value={slab.label ?? ""}
              onChange={(e) => onChange(index, "label", e.target.value)}
              placeholder="Standard"
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
      ) : null}
    </GlassCard>
  );
}
