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
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

type DailyCountRow = { day: Date; count: bigint };

export async function GET(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const rangeParam = url.searchParams.get("range") ?? "month";
  const monthKey = url.searchParams.get("month") ?? undefined;

  const range: DashboardRange =
    rangeParam === "7d" || rangeParam === "month" ? rangeParam : "month";

  if (range === "month" && monthKey && !/^\d{4}-\d{2}$/.test(monthKey)) {
    return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
  }

  const { start, end, label } = resolveDateRange(range, monthKey);
  const dateFilter = { soldAt: { gte: start, lte: end } };

  const [
    totalSales,
    dailyRows,
    modelGroups,
    officerGroups,
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
    prisma.saleEntry.groupBy({
      by: ["carModelId"],
      where: dateFilter,
      _count: { _all: true },
    }),
    prisma.saleEntry.groupBy({
      by: ["userId"],
      where: dateFilter,
      _count: { _all: true },
    }),
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

  const carIds = modelGroups.map((group) => group.carModelId);
  const userIds = officerGroups.map((group) => group.userId);

  const [cars, users] = await Promise.all([
    carIds.length
      ? prisma.carModel.findMany({
          where: { id: { in: carIds } },
          select: { id: true, name: true },
        })
      : [],
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [],
  ]);

  const carNameById = new Map(cars.map((car) => [car.id, car.name]));
  const userById = new Map(users.map((user) => [user.id, user]));

  const countsByDay = new Map<string, number>();
  for (const row of dailyRows) {
    const key = row.day.toISOString().slice(0, 10);
    countsByDay.set(key, Number(row.count));
  }

  const officerUnits = new Map(
    officerGroups.map((group) => [group.userId, group._count._all]),
  );

  const salesByModel = modelGroups
    .map((group) => ({
      modelName: carNameById.get(group.carModelId) ?? "Unknown model",
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const officerLeaderboard = aggregateByOfficerFromCounts(
    officerGroups.map((group) => {
      const user = userById.get(group.userId);
      return {
        userId: group.userId,
        units: group._count._all,
        name: user?.fullName ?? user?.email ?? "Unknown",
      };
    }),
    slabShapes,
  );

  return NextResponse.json({
    range,
    label,
    monthKey: range === "month" ? (monthKey ?? label) : null,
    kpis: computeDashboardKpisFromCounts(totalSales, officerUnits, officerCount, slabShapes),
    salesTrend: buildDailySalesSeriesFromCounts(countsByDay, start, end),
    salesByModel,
    officerLeaderboard,
    recentActivity: buildRecentActivity(recentEntries as SaleEntryRow[]),
  });
}
