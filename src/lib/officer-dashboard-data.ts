import { getActiveCars } from "@/lib/catalog-cache";
import { calculateIncentive } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import { buildChartSeriesFromDailyCounts, monthBoundsUtc } from "@/lib/sale-entry-utils";
import { unstable_cache } from "next/cache";

type DailyCountRow = { day: Date; count: bigint };

export async function loadOfficerDashboardData(userId: string, monthKey: string) {
  const { start, end } = monthBoundsUtc(monthKey);
  const where = {
    userId,
    soldAt: { gte: start, lte: end },
  };

  const [cars, slabShapes, totalUnits, dailyRows, entries] = await Promise.all([
    getActiveCars(),
    getIncentiveSlabShapes(),
    prisma.saleEntry.count({ where }),
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "soldAt" AT TIME ZONE 'UTC')::date AS day, COUNT(*)::bigint AS count
      FROM "SaleEntry"
      WHERE "userId" = ${userId}
        AND "soldAt" >= ${start}
        AND "soldAt" <= ${end}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.saleEntry.findMany({
      where,
      take: 50,
      orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        soldAt: true,
        carModel: { select: { id: true, name: true, imageUrl: true } },
      },
    }),
  ]);

  const payout = calculateIncentive(totalUnits, slabShapes);

  const countsByDay = new Map<number, number>();
  for (const row of dailyRows) {
    countsByDay.set(row.day.getUTCDate(), Number(row.count));
  }

  const chartSeries = buildChartSeriesFromDailyCounts(countsByDay, monthKey);

  return {
    monthKey,
    cars,
    slabs: slabShapes,
    entries: entries.map((entry) => ({
      id: entry.id,
      carModelId: entry.carModel.id,
      carName: entry.carModel.name,
      carImageUrl: entry.carModel.imageUrl,
      soldAt: entry.soldAt.toISOString(),
    })),
    totalUnits,
    payout,
    chartSeries,
  };
}

export function getCachedOfficerDashboard(userId: string, monthKey: string) {
  return unstable_cache(
    () => loadOfficerDashboardData(userId, monthKey),
    ["officer-dashboard", userId, monthKey],
    { revalidate: 30, tags: ["officer-dashboard", "sale-entries", `officer-${userId}`] },
  )();
}
