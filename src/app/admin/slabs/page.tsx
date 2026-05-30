"use client";

import { PayoutCurveChart, SlabScrubber, SlabTimeline } from "@/components/admin";
import {
  GlassAlert,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassSkeleton,
  PageHeader,
} from "@/components/glass";
import { SlabCard, TierLadder } from "@/components/incentive";
import { calculateIncentive } from "@/lib/incentive";
import type { PayoutResult, SlabShape } from "@/lib/incentive-types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const PROBE_UNITS = [0, 5, 10, 20, 30];

export default function AdminSlabsPage() {
  const [rows, setRows] = useState<SlabShape[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PayoutResult[]>([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probeUnits, setProbeUnits] = useState(10);
  const [activeTierIndex, setActiveTierIndex] = useState<number | null>(null);

  function sortRows(items: SlabShape[]) {
    return [...items].sort((a, b) => a.minUnits - b.minUnits);
  }

  const loadSlabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/slabs");
      if (!res.ok) throw new Error("Failed to load slabs");
      const data = (await res.json()) as SlabShape[];
      setRows(
        data.length
          ? sortRows(data.map((d) => ({ ...d, perUnitAmount: Number(d.perUnitAmount), label: d.label ?? "" })))
          : [{ minUnits: 0, maxUnits: 9, perUnitAmount: 1000, label: "Starter" }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load slabs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlabs();
  }, [loadSlabs]);

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
    const res = await fetch("/api/admin/slabs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.formErrors?.[0] ?? "Could not save slabs");
      setSaving(false);
      return;
    }
    setRows(sortRows(data.slabs.map((d: SlabShape) => ({ ...d, perUnitAmount: Number(d.perUnitAmount), label: d.label ?? "" }))));
    setPreview(data.preview ?? []);
    setDirty(false);
    setSaving(false);
  }

  function addRow() {
    const last = [...rows].sort((a, b) => a.minUnits - b.minUnits).at(-1);
    const minUnits =
      last?.maxUnits !== null && last?.maxUnits !== undefined ? last.maxUnits + 1 : (last?.minUnits ?? 0) + 1;
    setRows((prev) => sortRows([...prev, { minUnits, maxUnits: minUnits + 9, perUnitAmount: 1000, label: "Tier" }]));
    setDirty(true);
  }

  function updateRow(index: number, field: keyof SlabShape, value: string | number | null) {
    setRows((prev) =>
      sortRows(prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))),
    );
    setDirty(true);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setActiveTierIndex(null);
  }

  const displayPreview = preview.length ? preview : localPreview;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Slab Engine"
        badgeVariant="amber"
        description="Configure dynamic payout ranges for all sales officers."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty ? <GlassBadge variant="amber">Unsaved</GlassBadge> : null}
            <GlassButton type="button" variant="secondary" onClick={addRow}>
              Add tier
            </GlassButton>
            <GlassButton type="button" variant="accent" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save slabs"}
            </GlassButton>
          </div>
        }
      />
      <p className="text-xs text-muted">Changes affect incentive calculations instantly across dashboards.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <GlassSkeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : null}
      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      {!loading ? (
        <>
          <GlassCard className="p-4 sm:p-5">
            <SlabTimeline
              slabs={rows}
              activeIndex={activeTierIndex}
              onSelect={setActiveTierIndex}
            />
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SlabScrubber slabs={rows} units={probeUnits} onUnitsChange={setProbeUnits} />
            <TierLadder slabs={rows} totalUnits={probeUnits} />
          </div>

          <PayoutCurveChart slabs={rows} probeUnits={probeUnits} />

          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={`${row.id ?? "new"}-${index}`}
                className={cn(
                  activeTierIndex === index &&
                    "rounded-xl ring-2 ring-orange-400/50 ring-offset-2 ring-offset-transparent",
                )}
              >
                <SlabCard
                  slab={row}
                  index={index}
                  onChange={updateRow}
                  onRemove={removeRow}
                  canRemove={rows.length > 1}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}

      <GlassCard className="p-4 sm:p-5">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
          Live payout preview
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {displayPreview.map((entry) => (
            <motion.div
              key={entry.totalUnits}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <p className="font-mono text-xs text-muted">{entry.totalUnits} units</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{entry.slabLabel}</p>
              <p className="font-mono text-xs text-muted">₹{entry.perUnitAmount.toLocaleString()}/u</p>
              <p className="mt-2 font-mono text-sm font-bold text-orange-400">
                ₹{entry.totalPayout.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
