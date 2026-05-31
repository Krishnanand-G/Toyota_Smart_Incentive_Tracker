import { currentMonthKey } from "@/lib/date-picker-utils";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/sale-entry-utils";

export function isEntryInMonth(soldAt: Date, monthKey: string) {
  return monthKeyFromDate(soldAt) === monthKey;
}

export async function getOfficerSaleEntryForEdit(entryId: string, userId: string) {
  return prisma.saleEntry.findFirst({
    where: { id: entryId, userId },
    select: {
      id: true,
      soldAt: true,
      carModelId: true,
      carModel: { select: { id: true, name: true, imageUrl: true } },
    },
  });
}

export function assertSaleEntryEditable(soldAt: Date) {
  const monthKey = currentMonthKey();
  if (!isEntryInMonth(soldAt, monthKey)) {
    return {
      ok: false as const,
      error: "Only sales from the current month can be edited.",
    };
  }
  return { ok: true as const, monthKey };
}
