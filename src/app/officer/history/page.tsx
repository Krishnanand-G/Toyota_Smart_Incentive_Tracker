"use client";

import { GlassAlert, GlassBadge, GlassCard, GlassSkeleton, PageHeader } from "@/components/glass";
import { motion } from "framer-motion";
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
    <div className="space-y-6">
      <PageHeader
        badge="History"
        description="Review monthly submission history and payout totals."
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : null}
      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}
      {!loading && !rows.length && !error ? (
        <GlassCard className="p-6 text-sm text-muted">No history yet.</GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-3">
        {rows.map((row) => (
          <motion.div key={row.id} whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
            <GlassCard className="flex flex-wrap items-center justify-between gap-3 border border-white/10 p-4 hover:border-white/20">
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">{row.monthKey}</p>
                <p className="text-xs text-muted">
                  {row.submittedAt ? `Submitted ${new Date(row.submittedAt).toLocaleDateString()}` : "Draft"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <GlassBadge variant={row.status === "SUBMITTED" ? "green" : "amber"}>{row.status}</GlassBadge>
                <p className="font-mono text-sm text-muted">{row.totalUnits} units</p>
                <p className="font-mono text-sm font-semibold text-orange-400">
                  ₹{Number(row.totalIncentive).toLocaleString()}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
