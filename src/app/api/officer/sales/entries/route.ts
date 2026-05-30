import { Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { calculateIncentive, getSlabIndex } from "@/lib/incentive";
import { getIncentiveSlabShapes } from "@/lib/incentive-slabs";
import { prisma } from "@/lib/prisma";
import {
  monthBoundsUtc,
  monthKeyFromDate,
  soldAtFromDateInput,
} from "@/lib/sale-entry-utils";
import { createSaleEntrySchema } from "@/lib/validations/sale-entry";

function normalizeSoldAt(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return soldAtFromDateInput(value);
  }
  return new Date(value);
}

export async function POST(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = createSaleEntrySchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.carModelId?.[0] ??
      fieldErrors.soldAt?.[0] ??
      parsed.error.flatten().formErrors[0] ??
      "Invalid sale data";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const soldAt = normalizeSoldAt(parsed.data.soldAt);
  const entryMonthKey = monthKeyFromDate(soldAt);

  if (parsed.data.monthKey && parsed.data.monthKey !== entryMonthKey) {
    return NextResponse.json(
      { error: "Sale date must fall within the selected month" },
      { status: 400 },
    );
  }

  const car = await prisma.carModel.findFirst({
    where: { id: parsed.data.carModelId, isActive: true },
  });
  if (!car) {
    return NextResponse.json({ error: "Invalid or inactive car model" }, { status: 400 });
  }

  const slabShapes = await getIncentiveSlabShapes();

  const { start, end } = monthBoundsUtc(entryMonthKey);
  const previousCount = await prisma.saleEntry.count({
    where: {
      userId: auth.profile.id,
      soldAt: { gte: start, lte: end },
    },
  });

  const previousTierIndex = getSlabIndex(previousCount, slabShapes);

  const entry = await prisma.saleEntry.create({
    data: {
      userId: auth.profile.id,
      carModelId: parsed.data.carModelId,
      soldAt,
    },
    include: {
      carModel: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  const newCount = previousCount + 1;
  const newTierIndex = getSlabIndex(newCount, slabShapes);
  const payout = calculateIncentive(newCount, slabShapes);
  const tierUnlocked = newTierIndex > previousTierIndex && newTierIndex > 0;

  revalidateTag("admin-dashboard");
  revalidateTag("officer-dashboard");
  revalidateTag(`officer-${auth.profile.id}`);
  revalidateTag("sale-entries");

  return NextResponse.json({
    entry: {
      id: entry.id,
      carModelId: entry.carModelId,
      carName: entry.carModel.name,
      carImageUrl: entry.carModel.imageUrl,
      soldAt: entry.soldAt.toISOString(),
    },
    monthKey: entryMonthKey,
    payout,
    previousTierIndex,
    newTierIndex,
    tierUnlocked,
    tierLabel: tierUnlocked ? payout.slabLabel : null,
  });
}
