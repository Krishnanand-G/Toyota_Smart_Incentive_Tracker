import { Role } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { firstZodFieldMessage, jsonError } from "@/lib/api-errors";
import { requireRole } from "@/lib/auth";
import {
  assertSaleEntryEditable,
  getOfficerSaleEntryForEdit,
} from "@/lib/sale-entry-edit";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate, soldAtFromDateInput } from "@/lib/sale-entry-utils";
import { updateSaleEntrySchema } from "@/lib/validations/sale-entry";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeSoldAt(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return soldAtFromDateInput(value);
  }
  return new Date(value);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole(Role.OFFICER);
    if (auth.error) return auth.error;
    if (!auth.profile) return jsonError("Unauthorized", 401);

    const { id } = await context.params;
    const payload = await request.json();
    const parsed = updateSaleEntrySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        firstZodFieldMessage(parsed.error, ["carModelId", "soldAt"]),
        400,
      );
    }

    const existing = await getOfficerSaleEntryForEdit(id, auth.profile.id);
    if (!existing) {
      return jsonError("Sale not found.", 404);
    }

    const editableCheck = assertSaleEntryEditable(existing.soldAt);
    if (!editableCheck.ok) {
      return jsonError(editableCheck.error, 403);
    }

    const soldAt = normalizeSoldAt(parsed.data.soldAt);
    const newMonthKey = monthKeyFromDate(soldAt);
    if (newMonthKey !== editableCheck.monthKey) {
      return jsonError("Sale date must stay within the current month.", 400);
    }

    const car = await prisma.carModel.findFirst({
      where: { id: parsed.data.carModelId, isActive: true },
    });
    if (!car) {
      return jsonError("Invalid or inactive car model", 400);
    }

    const updated = await prisma.saleEntry.update({
      where: { id },
      data: {
        carModelId: parsed.data.carModelId,
        soldAt,
      },
      include: {
        carModel: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    revalidateTag("admin-dashboard");
    revalidateTag("officer-dashboard");
    revalidateTag(`officer-${auth.profile.id}`);
    revalidateTag("sale-entries");
    revalidatePath("/officer");
    revalidatePath("/officer/history");
    revalidatePath("/officer/log-sale");

    return NextResponse.json({
      entry: {
        id: updated.id,
        carModelId: updated.carModelId,
        carName: updated.carModel.name,
        carImageUrl: updated.carModel.imageUrl,
        soldAt: updated.soldAt.toISOString(),
        monthKey: newMonthKey,
      },
    });
  } catch {
    return jsonError("Could not update sale", 500);
  }
}
