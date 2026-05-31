"use client";

import { OfficerDetailPanel, OfficerFormModal, OfficerListItem, OfficerStatsStrip, type OfficerSummary } from "@/components/admin";
import { GlassAlert, GlassButton, GlassCard, GlassInput, GlassSkeleton, MobileBottomSheet, PageHeader } from "@/components/glass";
import { toggleSelection } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-is-mobile";
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

type AdminOfficersClientProps = {
  initialOfficers: OfficerSummary[];
};

export function AdminOfficersClient({ initialOfficers }: AdminOfficersClientProps) {
  const isMobile = useIsMobile();
  const [officers, setOfficers] = useState<OfficerSummary[]>(initialOfficers);
  const [loading, setLoading] = useState(false);
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

  const totalMonthSales = useMemo(
    () => officers.reduce((sum, officer) => sum + officer.thisMonthSales, 0),
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

  function closeDetail() {
    setSelectedOfficerId(null);
  }

  function selectOfficer(id: string) {
    setSelectedOfficerId((current) => toggleSelection(current, id));
  }

  const sheetTitle = selectedOfficer?.fullName || selectedOfficer?.officerId || "Sales officer";

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        badge="Sales Officer Ops"
        badgeVariant="green"
        description="Manage your sales team, track activity, and review monthly performance."
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:gap-3">
            <div className="glass-section px-3 py-1.5 text-center sm:px-4 sm:py-2">
              <p className="font-mono text-lg font-semibold text-foreground sm:text-xl">{officers.length}</p>
              <p className="text-[10px] text-muted sm:text-xs">Sales officers</p>
            </div>
            <GlassButton type="button" variant="accent" className="w-full sm:w-auto" onClick={openCreateModal}>
              <UserPlus size={16} />
              Add sales officer
            </GlassButton>
          </div>
        }
      />

      {!loading && officers.length > 0 ? <OfficerStatsStrip stats={stats} /> : null}

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3 lg:space-y-4">
          <GlassInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <GlassSkeleton key={i} className="h-24 w-full lg:h-28" />
              ))}
            </div>
          ) : null}

          {!loading && !filteredOfficers.length ? (
            <GlassCard className="p-6 text-center text-sm text-muted lg:p-8">
              {searchQuery
                ? "No sales officers match your search."
                : "No sales officers yet. Add your first sales officer to get started."}
            </GlassCard>
          ) : null}

          {!loading && filteredOfficers.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {filteredOfficers.map((officer) => (
                <OfficerListItem
                  key={officer.id}
                  officer={officer}
                  selected={selectedOfficerId === officer.id}
                  totalMonthSales={totalMonthSales}
                  onSelect={selectOfficer}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <OfficerDetailPanel
            officer={selectedOfficer}
            historyRows={historyRows}
            historyLoading={historyLoading}
            onClose={closeDetail}
            onEdit={openEditModal}
          />
        </div>
      </div>

      {isMobile && selectedOfficer ? (
        <MobileBottomSheet open onClose={closeDetail} title={sheetTitle}>
          <OfficerDetailPanel
            variant="sheet"
            officer={selectedOfficer}
            historyRows={historyRows}
            historyLoading={historyLoading}
            onClose={closeDetail}
            onEdit={openEditModal}
          />
        </MobileBottomSheet>
      ) : null}

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
