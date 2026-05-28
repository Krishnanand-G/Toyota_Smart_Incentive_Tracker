import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  if (!auth.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const userIdParam = url.searchParams.get("userId");
  const monthKey = url.searchParams.get("month");

  const isAdmin = auth.profile.role === Role.ADMIN;
  const userId = isAdmin && userIdParam ? userIdParam : auth.profile.id;

  const sales = await prisma.monthlySale.findMany({
    where: {
      userId,
      ...(monthKey ? { monthKey } : {}),
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      items: { include: { carModel: { select: { id: true, name: true } } } },
    },
    orderBy: { monthKey: "desc" },
  });

  return NextResponse.json(sales);
}
