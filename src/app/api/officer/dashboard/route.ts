import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getActiveCars } from "@/lib/catalog-cache";
import { requireRole } from "@/lib/auth";
import { calculateIncentive } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import { buildChartSeries, monthBoundsUtc } from "@/lib/sale-entry-utils";

export async function GET(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const monthKey = url.searchParams.get("month");
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return NextResponse.json({ error: "month query is required (YYYY-MM)" }, { status: 400 });
  }

  const { start, end } = monthBoundsUtc(monthKey);

  const [cars, slabShapes, entries] = await Promise.all([
    getActiveCars(),
    getIncentiveSlabShapes(),
    prisma.saleEntry.findMany({
      where: {
        userId: auth.profile.id,
        soldAt: { gte: start, lte: end },
      },
      include: {
        carModel: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: [{ soldAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalUnits = entries.length;
  const payout = calculateIncentive(totalUnits, slabShapes);
  const chartSeries = buildChartSeries(
    entries.map((entry) => entry.soldAt),
    monthKey,
  );

  return NextResponse.json({
    monthKey,
    cars,
    slabs: slabShapes,
    entries: entries.map((entry) => ({
      id: entry.id,
      carModelId: entry.carModelId,
      carName: entry.carModel.name,
      carImageUrl: entry.carModel.imageUrl,
      soldAt: entry.soldAt.toISOString(),
    })),
    totalUnits,
    payout,
    chartSeries,
  });
}
