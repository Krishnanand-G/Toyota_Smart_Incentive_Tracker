import {
  aggregateByOfficerFromCounts,
  buildDailySalesSeriesFromCounts,
  buildRecentActivity,
  computeDashboardKpisFromCounts,
  resolveDateRange,
  type DashboardRange,
  type SaleEntryRow,
} from "@/lib/admin-dashboard-utils";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { unstable_cache } from "next/cache";

type DailyCountRow = { day: Date; count: bigint };

type ModelCountRow = { modelName: string; count: bigint };
type OfficerCountRow = {
  userId: string;
  fullName: string | null;
  email: string;
  count: bigint;
};

export async function loadAdminDashboardData(range: DashboardRange, monthKey?: string) {
  const { start, end, label } = resolveDateRange(range, monthKey);
  const dateFilter = { soldAt: { gte: start, lte: end } };

  const [
    totalSales,
    dailyRows,
    modelRows,
    officerRows,
    recentEntries,
    slabShapes,
    officerCount,
  ] = await Promise.all([
    prisma.saleEntry.count({ where: dateFilter }),
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "soldAt" AT TIME ZONE 'UTC')::date AS day, COUNT(*)::bigint AS count
      FROM "SaleEntry"
      WHERE "soldAt" >= ${start} AND "soldAt" <= ${end}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<ModelCountRow[]>`
      SELECT c.name AS "modelName", COUNT(*)::bigint AS count
      FROM "SaleEntry" se
      INNER JOIN "CarModel" c ON c.id = se."carModelId"
      WHERE se."soldAt" >= ${start} AND se."soldAt" <= ${end}
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `,
    prisma.$queryRaw<OfficerCountRow[]>`
      SELECT u.id AS "userId", u."fullName", u.email, COUNT(*)::bigint AS count
      FROM "SaleEntry" se
      INNER JOIN "User" u ON u.id = se."userId"
      WHERE se."soldAt" >= ${start} AND se."soldAt" <= ${end}
      GROUP BY u.id, u."fullName", u.email
      ORDER BY count DESC
    `,
    prisma.saleEntry.findMany({
      where: dateFilter,
      take: 15,
      orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        soldAt: true,
        userId: true,
        user: { select: { fullName: true, email: true } },
        carModel: { select: { name: true } },
      },
    }),
    getIncentiveSlabShapes(),
    prisma.user.count({ where: { role: Role.OFFICER, isActive: true } }),
  ]);

  const countsByDay = new Map<string, number>();
  for (const row of dailyRows) {
    countsByDay.set(row.day.toISOString().slice(0, 10), Number(row.count));
  }

  const officerUnits = new Map(officerRows.map((row) => [row.userId, Number(row.count)]));

  const salesByModel = modelRows.map((row) => ({
    modelName: row.modelName,
    count: Number(row.count),
  }));

  const officerLeaderboard = aggregateByOfficerFromCounts(
    officerRows.map((row) => ({
      userId: row.userId,
      units: Number(row.count),
      name: row.fullName ?? row.email ?? "Unknown",
    })),
    slabShapes,
  );

  return {
    range,
    label,
    monthKey: range === "month" ? (monthKey ?? label) : null,
    kpis: computeDashboardKpisFromCounts(totalSales, officerUnits, officerCount, slabShapes),
    salesTrend: buildDailySalesSeriesFromCounts(countsByDay, start, end),
    salesByModel,
    officerLeaderboard,
    recentActivity: buildRecentActivity(recentEntries as SaleEntryRow[]),
  };
}

export function getCachedAdminDashboard(range: DashboardRange, monthKey?: string) {
  const cacheKey = monthKey ?? "current";
  return unstable_cache(
    () => loadAdminDashboardData(range, monthKey),
    ["admin-dashboard", range, cacheKey],
    { revalidate: 30, tags: ["admin-dashboard", "sale-entries"] },
  )();
}
