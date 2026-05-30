import { getCachedAdminDashboard } from "@/lib/admin-dashboard-data";
import type { DashboardRange } from "@/lib/admin-dashboard-utils";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const rangeParam = url.searchParams.get("range") ?? "month";
  const monthKey = url.searchParams.get("month") ?? undefined;

  const range: DashboardRange =
    rangeParam === "7d" || rangeParam === "month" ? rangeParam : "month";

  if (range === "month" && monthKey && !/^\d{4}-\d{2}$/.test(monthKey)) {
    return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
  }

  const data = await getCachedAdminDashboard(range, monthKey);
  return NextResponse.json(data);
}
