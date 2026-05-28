import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { calculateIncentive } from "@/lib/incentive";
import { slabBatchSchema } from "@/lib/validations/slab";

export async function GET() {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const slabs = await prisma.incentiveSlab.findMany({
    orderBy: { minUnits: "asc" },
  });

  return NextResponse.json(slabs);
}

export async function PUT(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const payload = await request.json();
  const parsed = slabBatchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.incentiveSlab.deleteMany();
    for (const slab of parsed.data) {
      await tx.incentiveSlab.create({
        data: {
          minUnits: slab.minUnits,
          maxUnits: slab.maxUnits,
          perUnitAmount: new Prisma.Decimal(slab.perUnitAmount),
          label: slab.label ?? null,
        },
      });
    }
  });

  const slabs = await prisma.incentiveSlab.findMany({
    orderBy: { minUnits: "asc" },
  });

  const preview = [0, 5, 10, 20, 30].map((units) => calculateIncentive(units, slabs));
  return NextResponse.json({ slabs, preview });
}
