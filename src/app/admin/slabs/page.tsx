"use client";

import { GlassBadge, GlassCard, GlassInput } from "@/components/glass";
import { useEffect, useMemo, useState } from "react";

type Slab = {
  id?: string;
  minUnits: number;
  maxUnits: number | null;
  perUnitAmount: number;
  label: string | null;
};

type Preview = {
  totalUnits: number;
  slabLabel: string;
  perUnitAmount: number;
  totalPayout: number;
  nextTierDeltaUnits: number | null;
};

export default function AdminSlabsPage() {
  const [rows, setRows] = useState<Slab[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Preview[]>([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSlabs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/slabs");
      if (!res.ok) throw new Error("Failed to load slabs");
      const data = (await res.json()) as Slab[];
      setRows(
        data.length
          ? data.map((d) => ({ ...d, perUnitAmount: Number(d.perUnitAmount), label: d.label ?? "" }))
          : [{ minUnits: 0, maxUnits: 9, perUnitAmount: 1000, label: "Starter" }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load slabs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlabs();
  }, []);

  const localPreview = useMemo(() => {
    const probes = [0, 5, 10, 20, 30];
    return probes.map((units) => {
      const row =
        [...rows]
          .sort((a, b) => a.minUnits - b.minUnits)
          .find((slab) => units >= slab.minUnits && (slab.maxUnits === null || units <= slab.maxUnits)) ?? rows[0];
      const amount = Number(row?.perUnitAmount ?? 0);
      return {
        totalUnits: units,
        slabLabel: row?.label || "N/A",
        perUnitAmount: amount,
        totalPayout: units * amount,
        nextTierDeltaUnits: null,
      };
    });
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
    setRows(data.slabs.map((d: Slab) => ({ ...d, perUnitAmount: Number(d.perUnitAmount), label: d.label ?? "" })));
    setPreview(data.preview ?? []);
    setDirty(false);
    setSaving(false);
  }

  function addRow() {
    const last = [...rows].sort((a, b) => a.minUnits - b.minUnits).at(-1);
    const minUnits = last?.maxUnits !== null && last?.maxUnits !== undefined ? last.maxUnits + 1 : (last?.minUnits ?? 0) + 1;
    setRows((prev) => [...prev, { minUnits, maxUnits: minUnits + 9, perUnitAmount: 1000, label: "Tier" }]);
    setDirty(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassBadge variant="amber">Stage 4</GlassBadge>
          <p className="text-sm text-slate-600">Configure incentive slab ranges and payout rules.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? <GlassBadge>Unsaved changes</GlassBadge> : null}
          <button type="button" onClick={addRow} className="glass-pill rounded-full px-4 py-2 text-sm text-slate-700">
            Add slab
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save slabs"}
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading slabs...</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <GlassCard className="overflow-x-auto p-3">
        <table className="w-full min-w-[650px] text-sm">
          <thead>
            <tr className="border-b border-slate-200/70 text-left text-slate-600">
              <th className="px-2 py-2">Label</th>
              <th className="px-2 py-2">Min Units</th>
              <th className="px-2 py-2">Max Units</th>
              <th className="px-2 py-2">Per Unit Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.id ?? "new"}-${index}`} className="border-b border-slate-100">
                <td className="px-2 py-2">
                  <GlassInput
                    value={row.label ?? ""}
                    onChange={(e) => {
                      setRows((prev) => prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)));
                      setDirty(true);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <GlassInput
                    type="number"
                    min={0}
                    value={row.minUnits}
                    onChange={(e) => {
                      setRows((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, minUnits: Number(e.target.value) } : item)),
                      );
                      setDirty(true);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <GlassInput
                    type="number"
                    min={0}
                    value={row.maxUnits ?? ""}
                    placeholder="Leave empty for open-ended"
                    onChange={(e) => {
                      const value = e.target.value;
                      setRows((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, maxUnits: value ? Number(value) : null } : item)),
                      );
                      setDirty(true);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <GlassInput
                    type="number"
                    min={0}
                    value={row.perUnitAmount}
                    onChange={(e) => {
                      setRows((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, perUnitAmount: Number(e.target.value) } : item)),
                      );
                      setDirty(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Live payout preview</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(preview.length ? preview : localPreview).map((entry) => (
            <div key={entry.totalUnits} className="rounded-xl border border-white/60 bg-white/45 p-3">
              <p className="text-xs text-slate-500">{entry.totalUnits} units</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{entry.slabLabel}</p>
              <p className="text-xs text-slate-600">Per unit: {entry.perUnitAmount.toLocaleString()}</p>
              <p className="mt-2 text-sm font-bold text-blue-700">{entry.totalPayout.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
