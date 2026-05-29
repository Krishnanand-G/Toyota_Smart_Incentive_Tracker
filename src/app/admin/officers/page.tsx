"use client";

import {
  GlassAlert,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassInput,
  GlassModal,
  GlassSkeleton,
  PageHeader,
} from "@/components/glass";
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
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    const res = await fetch("/api/admin/officers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data?.error?.formErrors?.[0] ?? "Could not create officer");
      return;
    }
    setOpen(false);
    setEmail("");
    setFullName("");
    await loadOfficers();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Officer Ops"
        badgeVariant="green"
        description="Manage officers and submission activity."
        actions={
          <GlassButton type="button" variant="accent" onClick={() => setOpen(true)}>
            Create officer
          </GlassButton>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <GlassSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : null}
      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}
      {!loading && !officers.length && !error ? (
        <GlassCard className="p-6 text-sm text-muted">No officers found.</GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {officers.map((officer) => (
          <GlassCard
            key={officer.id}
            className={`space-y-2 border p-4 transition ${
              selectedOfficerId === officer.id
                ? "border-orange-500/50 ring-1 ring-orange-500/30"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{officer.fullName || "Unnamed Officer"}</h3>
              <GlassBadge variant={officer.submissions > 0 ? "blue" : "default"}>
                {officer.submissions > 0 ? `${officer.submissions} submissions` : "No submissions"}
              </GlassBadge>
            </div>
            <p className="text-sm text-muted">{officer.email}</p>
            <p className="text-xs text-muted">Latest month: {officer.latestMonth ?? "N/A"}</p>
            <GlassButton
              type="button"
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => setSelectedOfficerId(officer.id)}
            >
              View history
            </GlassButton>
          </GlassCard>
        ))}
      </div>

      {selectedOfficerId ? (
        <GlassCard className="space-y-3 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Submission history</h3>
            <button type="button" onClick={() => setSelectedOfficerId(null)} className="text-xs text-muted hover:text-foreground">
              Close
            </button>
          </div>
          {!historyRows.length ? (
            <p className="text-sm text-muted">No submission history.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted">
                    <th className="px-2 py-2">Month</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Units</th>
                    <th className="px-2 py-2">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="px-2 py-2 text-foreground">{row.monthKey}</td>
                      <td className="px-2 py-2">
                        <GlassBadge variant={row.status === "SUBMITTED" ? "green" : "amber"}>{row.status}</GlassBadge>
                      </td>
                      <td className="px-2 py-2 font-mono text-muted">{row.totalUnits}</td>
                      <td className="px-2 py-2 font-mono font-semibold text-orange-400">
                        ₹{Number(row.totalIncentive).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      ) : null}

      <GlassModal open={open} onClose={() => setOpen(false)} title="Create officer">
        <form onSubmit={createOfficer} className="space-y-3">
          {formError ? <GlassAlert variant="error">{formError}</GlassAlert> : null}
          <div>
            <label className="mb-1.5 block text-sm text-muted">Full name</label>
            <GlassInput value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Email</label>
            <GlassInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <p className="text-xs text-muted">
            Creates the Prisma user row. Add matching credentials in Supabase Auth for sign-in.
          </p>
          <div className="flex justify-end">
            <GlassButton type="submit" variant="accent">
              Create
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
