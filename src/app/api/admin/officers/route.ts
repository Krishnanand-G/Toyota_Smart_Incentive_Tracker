import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { monthBoundsUtc, monthKeyFromDate } from "@/lib/sale-entry-utils";
import {
  createSupabaseOfficerUser,
} from "@/lib/officer-auth";
import { hashPassword } from "@/lib/password";
import { hasSupabaseAdmin } from "@/lib/supabase/admin";
import { createOfficerSchema } from "@/lib/validations/officer";

type OfficerStatsRow = {
  userId: string;
  totalSales: bigint;
  thisMonthSales: bigint;
  activeMonths: bigint;
  latestMonth: string | null;
};

export async function GET() {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

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

  const data = officers.map((officer) => {
    const stats = statsByUserId.get(officer.id);
    return {
      id: officer.id,
      email: officer.email,
      fullName: officer.fullName,
      officerId: officer.officerId,
      photoUrl: officer.photoUrl,
      isActive: officer.isActive,
      totalSales: Number(stats?.totalSales ?? 0),
      thisMonthSales: Number(stats?.thisMonthSales ?? 0),
      activeMonths: Number(stats?.activeMonths ?? 0),
      latestMonth: stats?.latestMonth ?? null,
      createdAt: officer.createdAt.toISOString(),
    };
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const payload = await request.json();
  const parsed = createOfficerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const { fullName, officerId, password, photoUrl } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { officerId }],
    },
    select: { email: true, officerId: true },
  });

  if (existing?.email === email) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }
  if (existing?.officerId === officerId) {
    return NextResponse.json({ error: "This sales officer ID is already in use." }, { status: 409 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required to create sales officer login credentials. Add it to your .env file.",
      },
      { status: 503 },
    );
  }

  const authResult = await createSupabaseOfficerUser({
    authId: "",
    email,
    fullName,
    officerId,
    password,
  });

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: 502 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      authId: authResult.authId,
      email,
      fullName,
      officerId,
      photoUrl: photoUrl ?? null,
      passwordHash,
      role: Role.OFFICER,
      isActive: true,
    },
  });

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      officerId: user.officerId,
      photoUrl: user.photoUrl,
      hasPassword: true,
      authLinked: true,
    },
    { status: 201 },
  );
}
