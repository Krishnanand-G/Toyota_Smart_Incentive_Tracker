"use client";

import { GlassBadge, GlassCard, GlassInput, GlassModal } from "@/components/glass";
import { useEffect, useState } from "react";

type Officer = {
  id: string;
  email: string;
  fullName: string | null;
  submissions: number;
  latestMonth: string | null;
  isActive: boolean;
};

type HistoryRow = {
  id: string;
  monthKey: string;
  status: "DRAFT" | "SUBMITTED";
  totalUnits: number;
  totalIncentive: number;
};

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);

  async function loadOfficers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/officers");
      if (!res.ok) throw new Error("Failed to load officers");
      setOfficers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load officers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOfficers();
  }, []);

  useEffect(() => {
    if (!selectedOfficerId) return;
    async function loadHistory() {
      const res = await fetch(`/api/history?userId=${selectedOfficerId}`);
      if (!res.ok) return;
      setHistoryRows(await res.json());
    }
    loadHistory();
  }, [selectedOfficerId]);

  async function createOfficer(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/admin/officers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error?.formErrors?.[0] ?? "Could not create officer");
      return;
    }
    setOpen(false);
    setEmail("");
    setFullName("");
    await loadOfficers();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassBadge variant="green">Stage 6</GlassBadge>
          <p className="text-sm text-slate-600">Manage officers and submission activity.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Create officer
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading officers...</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {!loading && !officers.length && !error ? (
        <GlassCard className="p-6 text-sm text-slate-600">No officers found.</GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {officers.map((officer) => (
          <GlassCard
            key={officer.id}
            className={`space-y-2 p-4 ${selectedOfficerId === officer.id ? "ring-2 ring-blue-300/60" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{officer.fullName || "Unnamed Officer"}</h3>
              <GlassBadge variant={officer.submissions > 0 ? "blue" : "default"}>
                {officer.submissions > 0 ? `${officer.submissions} submissions` : "No submissions yet"}
              </GlassBadge>
            </div>
            <p className="text-sm text-slate-600">{officer.email}</p>
            <p className="text-xs text-slate-500">Latest month: {officer.latestMonth ?? "N/A"}</p>
            <button
              type="button"
              className="glass-pill rounded-full px-3 py-1.5 text-xs font-medium text-slate-700"
              onClick={() => setSelectedOfficerId(officer.id)}
            >
              View history
            </button>
          </GlassCard>
        ))}
      </div>

      {selectedOfficerId ? (
        <GlassCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Officer submission history</h3>
            <button
              type="button"
              onClick={() => setSelectedOfficerId(null)}
              className="text-xs text-slate-500 underline"
            >
              Close
            </button>
          </div>
          {!historyRows.length ? (
            <p className="text-sm text-slate-500">No submission history.</p>
          ) : (
            historyRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-white/70 bg-white/50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">{row.monthKey}</p>
                  <GlassBadge variant={row.status === "SUBMITTED" ? "green" : "amber"}>{row.status}</GlassBadge>
                </div>
                <p className="text-slate-600">
                  {row.totalUnits} units - {Number(row.totalIncentive).toLocaleString()} payout
                </p>
              </div>
            ))
          )}
        </GlassCard>
      ) : null}

      <GlassModal open={open} onClose={() => setOpen(false)} title="Create officer">
        <form onSubmit={createOfficer} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <GlassInput value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <GlassInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <p className="text-xs text-slate-500">
            Note: this local flow creates the Prisma user row. Connect Supabase Admin API for invite/password provisioning.
          </p>
          <div className="flex justify-end">
            <button type="submit" className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">
              Create
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
