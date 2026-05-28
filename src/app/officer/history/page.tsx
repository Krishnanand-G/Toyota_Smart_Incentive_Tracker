"use client";

import { GlassBadge, GlassCard } from "@/components/glass";
import { useEffect, useState } from "react";

type HistoryRow = {
  id: string;
  monthKey: string;
  status: "DRAFT" | "SUBMITTED";
  totalUnits: number;
  totalIncentive: number;
  submittedAt: string | null;
};

export default function OfficerHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setRows(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <GlassBadge>Stage 6</GlassBadge>
        <p className="text-sm text-slate-600">View monthly submission history and payout totals.</p>
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading history...</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {!loading && !rows.length ? <GlassCard className="p-6 text-sm text-slate-600">No history yet.</GlassCard> : null}
      <div className="grid grid-cols-1 gap-3">
        {rows.map((row) => (
          <GlassCard key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{row.monthKey}</p>
              <p className="text-xs text-slate-500">
                {row.submittedAt ? `Submitted ${new Date(row.submittedAt).toLocaleDateString()}` : "Draft"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <GlassBadge variant={row.status === "SUBMITTED" ? "green" : "amber"}>{row.status}</GlassBadge>
              <p className="text-sm text-slate-700">{row.totalUnits} units</p>
              <p className="text-sm font-semibold text-blue-700">{Number(row.totalIncentive).toLocaleString()}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
