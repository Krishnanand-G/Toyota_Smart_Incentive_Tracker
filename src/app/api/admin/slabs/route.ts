import { Prisma, Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { jsonError, zodValidationResponse } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ensureIncentiveSlabs } from "@/lib/admin-slabs-data";
import { calculateIncentive } from "@/lib/incentive";
import { slabBatchSchema } from "@/lib/validations/slab";

export async function GET() {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    const slabs = await ensureIncentiveSlabs();

    return NextResponse.json(slabs);
  } catch {
    return jsonError("Could not load incentive slabs", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    const payload = await request.json();
    const parsed = slabBatchSchema.safeParse(payload);
    if (!parsed.success) {
      return zodValidationResponse(parsed.error);
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

    revalidateTag("incentive-slabs");
    revalidateTag("admin-dashboard");
    revalidateTag("officer-dashboard");
    revalidateTag("sale-entries");

    const slabs = await ensureIncentiveSlabs();

    const preview = [0, 5, 10, 20, 30].map((units) => calculateIncentive(units, slabs));
    return NextResponse.json({ slabs, preview });
  } catch {
    return jsonError("Could not save incentive slabs", 500);
  }
}
