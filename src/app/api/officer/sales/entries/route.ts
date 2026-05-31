import { Role } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { firstZodFieldMessage, jsonError } from "@/lib/api-errors";
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
  try {
    const auth = await requireRole(Role.OFFICER);
    if (auth.error) return auth.error;
    if (!auth.profile) return jsonError("Unauthorized", 401);

    const payload = await request.json();
    const parsed = createSaleEntrySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        firstZodFieldMessage(parsed.error, ["carModelId", "soldAt"]),
        400,
      );
    }

    const soldAt = normalizeSoldAt(parsed.data.soldAt);
    const entryMonthKey = monthKeyFromDate(soldAt);

    if (parsed.data.monthKey && parsed.data.monthKey !== entryMonthKey) {
      return jsonError("Sale date must fall within the selected month", 400);
    }

    const car = await prisma.carModel.findFirst({
      where: { id: parsed.data.carModelId, isActive: true },
    });
    if (!car) {
      return jsonError("Invalid or inactive car model", 400);
    }

    const slabShapes = await getIncentiveSlabShapes();

    const { start, end } = monthBoundsUtc(entryMonthKey);

    const { entry, newCount, previousCount } = await prisma.$transaction(async (tx) => {
      const created = await tx.saleEntry.create({
        data: {
          userId: auth.profile!.id,
          carModelId: parsed.data.carModelId,
          soldAt,
        },
        include: {
          carModel: { select: { id: true, name: true, imageUrl: true } },
        },
      });

      const count = await tx.saleEntry.count({
        where: {
          userId: auth.profile!.id,
          soldAt: { gte: start, lte: end },
        },
      });

      return { entry: created, newCount: count, previousCount: count - 1 };
    });

    const previousTierIndex = getSlabIndex(previousCount, slabShapes);
    const newTierIndex = getSlabIndex(newCount, slabShapes);
    const payout = calculateIncentive(newCount, slabShapes);
    const tierUnlocked = newTierIndex > previousTierIndex && newTierIndex > 0;

    revalidateTag("admin-dashboard");
    revalidateTag("officer-dashboard");
    revalidateTag(`officer-${auth.profile.id}`);
    revalidateTag("sale-entries");
    revalidatePath("/officer");
    revalidatePath("/officer/history");
    revalidatePath("/officer/log-sale");

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
  } catch {
    return jsonError("Could not log sale", 500);
  }
}
