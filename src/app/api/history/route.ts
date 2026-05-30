import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { calculateIncentive } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";

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

  const [monthRows, slabShapes] = await Promise.all([
    prisma.$queryRaw<MonthCountRow[]>`
      SELECT to_char("soldAt", 'YYYY-MM') AS month_key, COUNT(*)::int AS units
      FROM "SaleEntry"
      WHERE "userId" = ${userId}
      GROUP BY 1
      ORDER BY 1 DESC
    `,
    getIncentiveSlabShapes(),
  ]);

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
        entryCount: row.units,
      };
    });

  return NextResponse.json(months);
}
