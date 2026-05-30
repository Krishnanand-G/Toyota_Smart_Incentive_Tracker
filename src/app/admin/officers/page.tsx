"use client";

import {
  OfficerDetailPanel,
  OfficerFormModal,
  OfficerListItem,
  OfficerStatsStrip,
  type OfficerSummary,
} from "@/components/admin";
import { GlassAlert, GlassButton, GlassCard, GlassInput, GlassSkeleton, PageHeader } from "@/components/glass";
import { UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type HistoryRow = {
  id: string;
  monthKey: string;
  totalUnits: number;
  totalIncentive: number;
  slabLabel: string;
  entryCount: number;
};

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<OfficerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<OfficerSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadOfficers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/officers");
      if (!res.ok) throw new Error("Failed to load sales officers");
      setOfficers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sales officers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOfficers();
  }, [loadOfficers]);

  useEffect(() => {
    if (!selectedOfficerId) {
      setHistoryRows([]);
      return;
    }

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/history?userId=${selectedOfficerId}`);
        if (!res.ok) throw new Error("Failed to load history");
        setHistoryRows(await res.json());
      } catch {
        setHistoryRows([]);
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistory();
  }, [selectedOfficerId]);

  const filteredOfficers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return officers;
    return officers.filter(
      (officer) =>
        officer.email.toLowerCase().includes(q) ||
        (officer.fullName?.toLowerCase().includes(q) ?? false) ||
        (officer.officerId?.toLowerCase().includes(q) ?? false),
    );
  }, [officers, searchQuery]);

  const selectedOfficer = useMemo(
    () => officers.find((officer) => officer.id === selectedOfficerId) ?? null,
    [officers, selectedOfficerId],
  );

  const maxSales = useMemo(
    () => Math.max(...officers.map((officer) => officer.totalSales), 1),
    [officers],
  );

  const stats = useMemo(
    () => ({
      totalOfficers: officers.length,
      officersWithSales: officers.filter((officer) => officer.totalSales > 0).length,
      totalSales: officers.reduce((sum, officer) => sum + officer.totalSales, 0),
      activeThisMonth: officers.reduce((sum, officer) => sum + officer.thisMonthSales, 0),
    }),
    [officers],
  );

  function openCreateModal() {
    setEditingOfficer(null);
    setOpen(true);
  }

  function openEditModal(officer: OfficerSummary) {
    setEditingOfficer(officer);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Sales Officer Ops"
        badgeVariant="green"
        description="Manage your sales team, track activity, and review monthly performance."
        actions={
          <div className="flex items-center gap-3">
            <div className="glass-section hidden px-4 py-2 text-center sm:block">
              <p className="font-mono text-xl font-semibold text-foreground">{officers.length}</p>
              <p className="text-xs text-muted">Sales officers</p>
            </div>
            <GlassButton type="button" variant="accent" onClick={openCreateModal}>
              <UserPlus size={16} />
              Add sales officer
            </GlassButton>
          </div>
        }
      />

      {!loading && officers.length > 0 ? <OfficerStatsStrip stats={stats} /> : null}

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <GlassInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <GlassSkeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : null}

          {!loading && !filteredOfficers.length ? (
            <GlassCard className="p-8 text-center text-sm text-muted">
              {searchQuery
                ? "No sales officers match your search."
                : "No sales officers yet. Add your first sales officer to get started."}
            </GlassCard>
          ) : null}

          {!loading && filteredOfficers.length > 0 ? (
            <div className="space-y-3">
              {filteredOfficers.map((officer) => (
                <OfficerListItem
                  key={officer.id}
                  officer={officer}
                  selected={selectedOfficerId === officer.id}
                  maxSales={maxSales}
                  onSelect={setSelectedOfficerId}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <OfficerDetailPanel
            officer={selectedOfficer}
            historyRows={historyRows}
            historyLoading={historyLoading}
            onClose={() => setSelectedOfficerId(null)}
            onEdit={openEditModal}
          />
        </div>
      </div>

      <OfficerFormModal
        open={open}
        editing={editingOfficer}
        onClose={() => {
          setOpen(false);
          setEditingOfficer(null);
        }}
        onSaved={loadOfficers}
      />
    </div>
  );
}
