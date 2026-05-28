import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { createOfficerSchema } from "@/lib/validations/officer";

export async function GET() {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const officers = await prisma.user.findMany({
    where: { role: Role.OFFICER, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      monthlySales: {
        select: { id: true, status: true, monthKey: true, totalUnits: true, totalIncentive: true },
      },
    },
  });

  const data = officers.map((officer) => {
    const submitted = officer.monthlySales.filter((s) => s.status === "SUBMITTED").length;
    return {
      id: officer.id,
      email: officer.email,
      fullName: officer.fullName,
      isActive: officer.isActive,
      submissions: submitted,
      latestMonth: officer.monthlySales[0]?.monthKey ?? null,
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

  const user = await prisma.user.create({
    data: {
      authId: randomUUID(),
      email: parsed.data.email.toLowerCase(),
      fullName: parsed.data.fullName,
      role: Role.OFFICER,
      isActive: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
