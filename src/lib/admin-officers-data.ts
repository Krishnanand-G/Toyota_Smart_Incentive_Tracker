import type { OfficerSummary, OfficerStatsRow } from "@/lib/admin-types";
import { prisma } from "@/lib/prisma";
import { monthBoundsUtc, monthKeyFromDate } from "@/lib/sale-entry-utils";
import { Role } from "@prisma/client";

export async function getAdminOfficers(): Promise<OfficerSummary[]> {
  const currentMonthKey = monthKeyFromDate(new Date());
  const { start, end } = monthBoundsUtc(currentMonthKey);

  const [officers, statsRows] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.OFFICER, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        officerId: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.$queryRaw<OfficerStatsRow[]>`
      SELECT
        "userId",
        COUNT(*)::bigint AS "totalSales",
        COUNT(*) FILTER (
          WHERE "soldAt" >= ${start} AND "soldAt" <= ${end}
        )::bigint AS "thisMonthSales",
        COUNT(DISTINCT to_char("soldAt", 'YYYY-MM'))::bigint AS "activeMonths",
        MAX(to_char("soldAt", 'YYYY-MM')) AS "latestMonth"
      FROM "SaleEntry"
      GROUP BY "userId"
    `,
  ]);

  const statsByUserId = new Map(statsRows.map((row) => [row.userId, row]));

  return officers.map((officer) => {
    const stats = statsByUserId.get(officer.id);
    return {
      id: officer.id,
      email: officer.email,
      fullName: officer.fullName,
      officerId: officer.officerId,
      photoUrl: officer.photoUrl,
      totalSales: Number(stats?.totalSales ?? 0),
      thisMonthSales: Number(stats?.thisMonthSales ?? 0),
      activeMonths: Number(stats?.activeMonths ?? 0),
      latestMonth: stats?.latestMonth ?? null,
    };
  });
}
