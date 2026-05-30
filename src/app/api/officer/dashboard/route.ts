import { getCachedOfficerDashboard } from "@/lib/officer-dashboard-data";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireRole(Role.OFFICER);
  if (auth.error) return auth.error;
  if (!auth.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const monthKey = url.searchParams.get("month");
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return NextResponse.json({ error: "month query is required (YYYY-MM)" }, { status: 400 });
  }

  const data = await getCachedOfficerDashboard(auth.profile.id, monthKey);
  return NextResponse.json(data);
}
