"use client";

import { PayoutCurveChart, SlabScrubber, SlabTimeline } from "@/components/admin";
import { GlassAlert, GlassBadge, GlassButton, GlassCard, PageHeader } from "@/components/glass";
import { SlabCard, TierLadder } from "@/components/incentive";
import { calculateIncentive } from "@/lib/incentive";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { PayoutResult, SlabShape } from "@/lib/incentive-types";
import { normalizeSlabRows } from "@/lib/slab-defaults";
import { useIsMobile } from "@/lib/use-is-mobile";
import { cn, toggleSelection } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const PROBE_UNITS = [0, 5, 10, 20, 30];

type AdminSlabsClientProps = {
  initialSlabs: SlabShape[];
};

function sortRows(items: SlabShape[]) {
  return [...items].sort((a, b) => a.minUnits - b.minUnits);
}

export function AdminSlabsClient({ initialSlabs }: AdminSlabsClientProps) {
  const isMobile = useIsMobile();
  const [rows, setRows] = useState<SlabShape[]>(() => sortRows(initialSlabs));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<PayoutResult[]>([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probeUnits, setProbeUnits] = useState(10);
  const [activeTierIndex, setActiveTierIndex] = useState<number | null>(null);

  const localPreview = useMemo(() => {
    return PROBE_UNITS.map((units) => calculateIncentive(units, rows));
  }, [rows]);

  async function save() {
    setSaving(true);
    setError(null);
    const payload = rows.map((row) => ({
      ...row,
      maxUnits: row.maxUnits === null ? null : Number(row.maxUnits),
      perUnitAmount: Number(row.perUnitAmount),
      label: row.label || null,
    }));

    try {
      const res = await fetch("/api/admin/slabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        slabs?: SlabShape[];
        preview?: PayoutResult[];
        error?: unknown;
      };
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Could not save slabs"));
      }

      setRows(sortRows(normalizeSlabRows(data.slabs ?? [])));
      setPreview(data.preview ?? []);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save slabs");
    } finally {
      setSaving(false);
    }
  }

  function addRow() {
    const last = rows.at(-1);
    const minUnits =
      last?.maxUnits !== null && last?.maxUnits !== undefined ? last.maxUnits + 1 : (last?.minUnits ?? 0) + 1;
    setRows((prev) => {
      const next = [...prev, { minUnits, maxUnits: minUnits + 9, perUnitAmount: 1000, label: "Tier" }];
      setActiveTierIndex(next.length - 1);
      return next;
    });
    setDirty(true);
  }

  function updateRow(index: number, field: keyof SlabShape, value: string | number | null) {
    setRows((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    setDirty(true);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setActiveTierIndex(null);
  }

  function moveRow(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    setRows((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setDirty(true);
    setActiveTierIndex((current) => {
      if (current === null) return null;
      if (current === index) return targetIndex;
      if (current === targetIndex) return index;
      return current;
    });
  }

  function toggleTier(index: number) {
    setActiveTierIndex((current) => toggleSelection(current, index));
  }

  const displayPreview = preview.length ? preview : localPreview;

  return (
    <div className={cn("space-y-4 lg:space-y-6", dirty && isMobile && "pb-20")}>
      <PageHeader
        badge="Slab Engine"
        badgeVariant="amber"
        description="Configure dynamic payout ranges for all sales officers."
        actions={dirty ? <GlassBadge variant="amber">Unsaved</GlassBadge> : undefined}
      />
      <p className="hidden text-xs text-muted lg:block">
        Changes affect incentive calculations instantly across dashboards.
      </p>

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <GlassCard className="p-3 sm:p-5">
        <SlabTimeline slabs={rows} activeIndex={activeTierIndex} onSelect={setActiveTierIndex} />
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <SlabScrubber slabs={rows} units={probeUnits} onUnitsChange={setProbeUnits} />
        <TierLadder slabs={rows} totalUnits={probeUnits} />
      </div>

      <PayoutCurveChart slabs={rows} probeUnits={probeUnits} />

      <div className="space-y-3 lg:space-y-4">
        <div className="flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Edit tiers</h3>
          <p className="text-xs text-muted">
            {isMobile ? "Tap header or arrow to expand or collapse" : "Use arrows to reorder"}
          </p>
        </div>
        {rows.map((row, index) => (
          <div
            key={`${row.id ?? "new"}-${index}`}
            className={cn(
              activeTierIndex === index &&
                "rounded-md ring-2 ring-accent-primary ring-offset-2 ring-offset-background",
            )}
          >
            <SlabCard
              slab={row}
              index={index}
              onChange={updateRow}
              onRemove={removeRow}
              onMoveUp={(i) => moveRow(i, "up")}
              onMoveDown={(i) => moveRow(i, "down")}
              canRemove={rows.length > 1}
              canMoveUp={index > 0}
              canMoveDown={index < rows.length - 1}
              collapsible={isMobile}
              expanded={!isMobile || activeTierIndex === index}
              onToggle={() => toggleTier(index)}
            />
          </div>
        ))}
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 border-t border-border pt-4",
            dirty && isMobile && "hidden lg:flex",
          )}
        >
          <GlassButton type="button" variant="secondary" onClick={addRow}>
            Add tier
          </GlassButton>
          <GlassButton type="button" variant="accent" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save slabs"}
          </GlassButton>
        </div>
      </div>

      <GlassCard className="p-3 sm:p-5">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
          Live payout preview
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {displayPreview.map((entry) => (
            <motion.div
              key={entry.totalUnits}
              whileHover={{ scale: 1.02 }}
              className="rounded-md border border-border bg-surface-row p-2.5 lg:p-3"
            >
              <p className="font-mono text-xs text-muted">{entry.totalUnits} units</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{entry.slabLabel}</p>
              <p className="font-mono text-xs text-muted">₹{entry.perUnitAmount.toLocaleString()}/u</p>
              <p className="mt-1 font-mono text-sm font-bold text-accent-primary lg:mt-2">
                ₹{entry.totalPayout.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {dirty && isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 shadow-glass-elevated lg:hidden">
          <div className="flex gap-2">
            <GlassButton type="button" variant="secondary" className="flex-1" onClick={addRow}>
              Add tier
            </GlassButton>
            <GlassButton type="button" variant="accent" className="flex-1" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save slabs"}
            </GlassButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
