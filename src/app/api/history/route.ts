import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, routeErrorFromThrown } from "@/lib/api-errors";
import { requireAuth } from "@/lib/auth";
import {
  assertOfficerHistoryAccess,
  getOfficerHistoryMonths,
} from "@/lib/officer-history-data";
import { isValidMonthKey } from "@/lib/sale-entry-utils";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  if (!auth.profile) {
    return jsonError("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const userIdParam = url.searchParams.get("userId");
  const monthFilter = url.searchParams.get("month");

  if (monthFilter && !isValidMonthKey(monthFilter)) {
    return jsonError("Invalid month format", 400);
  }

  const isAdmin = auth.profile.role === Role.ADMIN;
  const userId = isAdmin && userIdParam ? userIdParam : auth.profile.id;

  try {
    if (isAdmin && userIdParam && userIdParam !== auth.profile.id) {
      await assertOfficerHistoryAccess(auth.profile.id, auth.profile.role, userId);
    }
    const months = await getOfficerHistoryMonths(userId, { monthFilter: monthFilter ?? undefined });
    return NextResponse.json(months);
  } catch (error) {
    return routeErrorFromThrown(error, {
      "Sales officer not found": 404,
      "Invalid month format": 400,
    });
  }
}
