import { calculateIncentive } from "@/lib/incentive";
import type { SlabShape } from "@/lib/incentive-types";
import { monthBoundsUtc, monthKeyFromDate } from "@/lib/sale-entry-utils";

import type { AdminSaleEntryRow } from "@/lib/admin-types";

export type DashboardRange = "7d" | "month";

export type TrendPoint = { date: string; cumulativeUnits: number; dailyUnits: number };

export type ModelBreakdown = { modelName: string; count: number };

export type OfficerRank = {
  officerId: string;
  officerName: string;
  units: number;
  payout: number;
};

export type RecentActivity = {
  id: string;
  officerName: string;
  carName: string;
  soldAt: string;
};

export function resolveDateRange(
  range: DashboardRange,
  monthKey?: string,
): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
  );

  if (range === "month") {
    const key = monthKey ?? monthKeyFromDate(now);
    const bounds = monthBoundsUtc(key);
    return { ...bounds, label: key };
  }

  const days = 7;
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  return { start, end, label: "Last 7 days" };
}

function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDailySalesSeries(
  entries: { soldAt: Date }[],
  start: Date,
  end: Date,
): TrendPoint[] {
  const countsByDay = new Map<string, number>();
  for (const entry of entries) {
    const key = formatDateKey(entry.soldAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  return buildDailySalesSeriesFromCounts(countsByDay, start, end);
}

export function buildDailySalesSeriesFromCounts(
  countsByDay: Map<string, number>,
  start: Date,
  end: Date,
): TrendPoint[] {
  const series: TrendPoint[] = [];
  let cumulative = 0;
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = formatDateKey(cursor);
    const dailyUnits = countsByDay.get(key) ?? 0;
    cumulative += dailyUnits;
    series.push({ date: key, cumulativeUnits: cumulative, dailyUnits });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return series;
}

export function aggregateByModel(entries: AdminSaleEntryRow[]): ModelBreakdown[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const name = entry.carModel.name;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([modelName, count]) => ({ modelName, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateByOfficerFromCounts(
  groups: { userId: string; units: number; name: string }[],
  slabs: SlabShape[],
): OfficerRank[] {
  return groups
    .map(({ userId, units, name }) => ({
      officerId: userId,
      officerName: name,
      units,
      payout: calculateIncentive(units, slabs).totalPayout,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);
}

export function aggregateByOfficer(
  entries: AdminSaleEntryRow[],
  slabs: SlabShape[],
): OfficerRank[] {
  const byOfficer = new Map<string, { name: string; units: number }>();

  for (const entry of entries) {
    const existing = byOfficer.get(entry.userId);
    const name = entry.user.fullName ?? entry.user.email;
    if (existing) {
      existing.units += 1;
    } else {
      byOfficer.set(entry.userId, { name, units: 1 });
    }
  }

  return [...byOfficer.entries()]
    .map(([officerId, { name, units }]) => ({
      officerId,
      officerName: name,
      units,
      payout: calculateIncentive(units, slabs).totalPayout,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);
}

export function buildRecentActivity(entries: AdminSaleEntryRow[], limit = 15): RecentActivity[] {
  return entries.slice(0, limit).map((entry) => ({
    id: entry.id,
    officerName: entry.user.fullName ?? entry.user.email,
    carName: entry.carModel.name,
    soldAt: entry.soldAt.toISOString(),
  }));
}

export function computeDashboardKpisFromCounts(
  totalSales: number,
  officerUnits: Map<string, number>,
  officerCount: number,
  slabs: SlabShape[],
) {
  const activeOfficers = officerUnits.size;
  const avgSalesPerOfficer =
    activeOfficers > 0 ? Math.round((totalSales / activeOfficers) * 10) / 10 : 0;

  let totalIncentiveLiability = 0;
  for (const units of officerUnits.values()) {
    totalIncentiveLiability += calculateIncentive(units, slabs).totalPayout;
  }

  return {
    totalSales,
    activeOfficers,
    registeredOfficers: officerCount,
    avgSalesPerOfficer,
    totalIncentiveLiability,
  };
}
