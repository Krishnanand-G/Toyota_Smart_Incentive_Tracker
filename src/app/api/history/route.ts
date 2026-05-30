import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { calculateIncentive } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import { monthBoundsUtc, monthKeyFromDate } from "@/lib/sale-entry-utils";

type MonthCountRow = {
  month_key: string;
  units: number;
};

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  if (!auth.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const userIdParam = url.searchParams.get("userId");
  const monthFilter = url.searchParams.get("month");

  const isAdmin = auth.profile.role === Role.ADMIN;
  const userId = isAdmin && userIdParam ? userIdParam : auth.profile.id;

  const entryWhere = monthFilter
    ? (() => {
        const { start, end } = monthBoundsUtc(monthFilter);
        return { userId, soldAt: { gte: start, lte: end } };
      })()
    : { userId };

  const [monthRows, slabShapes, saleEntries] = await Promise.all([
    prisma.$queryRaw<MonthCountRow[]>`
      SELECT to_char("soldAt", 'YYYY-MM') AS month_key, COUNT(*)::int AS units
      FROM "SaleEntry"
      WHERE "userId" = ${userId}
      GROUP BY 1
      ORDER BY 1 DESC
    `,
    getIncentiveSlabShapes(),
    prisma.saleEntry.findMany({
      where: entryWhere,
      orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        soldAt: true,
        carModel: { select: { name: true, imageUrl: true } },
      },
    }),
  ]);

  const entriesByMonth = new Map<
    string,
    { id: string; carName: string; carImageUrl: string; soldAt: string }[]
  >();

  for (const entry of saleEntries) {
    const key = monthKeyFromDate(entry.soldAt);
    const list = entriesByMonth.get(key) ?? [];
    list.push({
      id: entry.id,
      carName: entry.carModel.name,
      carImageUrl: entry.carModel.imageUrl,
      soldAt: entry.soldAt.toISOString(),
    });
    entriesByMonth.set(key, list);
  }

  const months = monthRows
    .filter((row) => !monthFilter || row.month_key === monthFilter)
    .map((row) => {
      const payout = calculateIncentive(row.units, slabShapes);
      return {
        id: `${userId}-${row.month_key}`,
        monthKey: row.month_key,
        totalUnits: row.units,
        totalIncentive: payout.totalPayout,
        slabLabel: payout.slabLabel,
        perUnitAmount: payout.perUnitAmount,
        entryCount: row.units,
        entries: entriesByMonth.get(row.month_key) ?? [],
      };
    });

  return NextResponse.json(months);
}
