import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { calculateIncentive } from "@/lib/incentive";
import { submitSaleSchema, upsertSaleSchema } from "@/lib/validations/sale";

export async function GET(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const monthKey = url.searchParams.get("month");
  if (!monthKey) {
    return NextResponse.json({ error: "month query is required" }, { status: 400 });
  }

  const sale = await prisma.monthlySale.findUnique({
    where: { userId_monthKey: { userId: auth.profile.id, monthKey } },
    include: { items: true },
  });

  const cars = await prisma.carModel.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const slabs = await prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } });
  const totalUnits = sale?.items.reduce((sum, item) => sum + item.units, 0) ?? 0;
  const payout = calculateIncentive(totalUnits, slabs);

  return NextResponse.json({
    sale,
    cars,
    slabs,
    payout,
    submitted: sale?.status === "SUBMITTED",
  });
}

export async function PUT(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = upsertSaleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.monthlySale.findUnique({
    where: {
      userId_monthKey: {
        userId: auth.profile.id,
        monthKey: parsed.data.monthKey,
      },
    },
  });

  if (existing?.status === "SUBMITTED") {
    return NextResponse.json({ error: "Submitted month is read-only" }, { status: 409 });
  }

  const slabs = await prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } });
  const totalUnits = parsed.data.items.reduce((sum, item) => sum + item.units, 0);
  const payout = calculateIncentive(totalUnits, slabs);

  const sale = await prisma.$transaction(async (tx) => {
    const monthly = await tx.monthlySale.upsert({
      where: { userId_monthKey: { userId: auth.profile!.id, monthKey: parsed.data.monthKey } },
      create: {
        userId: auth.profile!.id,
        monthKey: parsed.data.monthKey,
        totalUnits,
        totalIncentive: new Prisma.Decimal(payout.totalPayout),
      },
      update: {
        totalUnits,
        totalIncentive: new Prisma.Decimal(payout.totalPayout),
      },
    });

    await tx.monthlySaleItem.deleteMany({ where: { monthlyId: monthly.id } });
    if (parsed.data.items.length) {
      await tx.monthlySaleItem.createMany({
        data: parsed.data.items.map((item) => ({
          monthlyId: monthly.id,
          carModelId: item.carModelId,
          units: item.units,
        })),
      });
    }

    return tx.monthlySale.findUnique({
      where: { id: monthly.id },
      include: { items: true },
    });
  });

  return NextResponse.json({ sale, payout });
}

export async function POST(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = submitSaleSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.monthlySale.update({
    where: {
      userId_monthKey: {
        userId: auth.profile.id,
        monthKey: parsed.data.monthKey,
      },
    },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
