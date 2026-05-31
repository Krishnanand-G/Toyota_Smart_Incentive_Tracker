import { calculateIncentive } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import { monthBoundsUtc, monthKeyFromDate, isValidMonthKey } from "@/lib/sale-entry-utils";
import { Role } from "@prisma/client";

type MonthCountRow = {
  month_key: string;
  units: number;
};

export type OfficerHistoryMonth = {
  id: string;
  monthKey: string;
  totalUnits: number;
  totalIncentive: number;
  slabLabel: string;
  perUnitAmount: number;
  entryCount: number;
  entries: {
    id: string;
    carModelId: string;
    carName: string;
    carImageUrl: string;
    soldAt: string;
  }[];
};

export async function getOfficerHistoryMonths(
  userId: string,
  options?: { monthFilter?: string },
): Promise<OfficerHistoryMonth[]> {
  const monthFilter = options?.monthFilter;
  if (monthFilter && !isValidMonthKey(monthFilter)) {
    throw new Error("Invalid month format");
  }

  const entryWhere = monthFilter
    ? (() => {
        const { start, end } = monthBoundsUtc(monthFilter);
        return { userId, soldAt: { gte: start, lte: end } };
      })()
    : { userId };

  const [monthRows, slabShapes, saleEntries] = await Promise.all([
    prisma.$queryRaw<MonthCountRow[]>`
      SELECT to_char("soldAt" AT TIME ZONE 'UTC', 'YYYY-MM') AS month_key, COUNT(*)::int AS units
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
        carModelId: true,
        carModel: { select: { name: true, imageUrl: true } },
      },
    }),
  ]);

  const entriesByMonth = new Map<
    string,
    {
      id: string;
      carModelId: string;
      carName: string;
      carImageUrl: string;
      soldAt: string;
    }[]
  >();

  for (const entry of saleEntries) {
    const key = monthKeyFromDate(entry.soldAt);
    const list = entriesByMonth.get(key) ?? [];
    list.push({
      id: entry.id,
      carModelId: entry.carModelId,
      carName: entry.carModel.name,
      carImageUrl: entry.carModel.imageUrl,
      soldAt: entry.soldAt.toISOString(),
    });
    entriesByMonth.set(key, list);
  }

  return monthRows
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
}

export async function assertOfficerHistoryAccess(
  requesterId: string,
  requesterRole: Role,
  targetUserId: string,
) {
  if (requesterRole === Role.ADMIN && targetUserId !== requesterId) {
    const target = await prisma.user.findFirst({
      where: { id: targetUserId, role: Role.OFFICER, isActive: true },
      select: { id: true },
    });
    if (!target) {
      throw new Error("Sales officer not found");
    }
  }
}
