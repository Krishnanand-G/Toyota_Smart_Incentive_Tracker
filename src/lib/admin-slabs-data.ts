import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_INCENTIVE_SLABS, normalizeSlabRows } from "@/lib/slab-defaults";

export async function ensureIncentiveSlabs() {
  const existing = await prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } });
  if (existing.length) return existing;

  await prisma.incentiveSlab.createMany({
    data: DEFAULT_INCENTIVE_SLABS.map((slab) => ({
      minUnits: slab.minUnits,
      maxUnits: slab.maxUnits,
      perUnitAmount: new Prisma.Decimal(Number(slab.perUnitAmount)),
      label: slab.label,
    })),
  });

  return prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } });
}

export async function getAdminSlabRows() {
  const slabs = await ensureIncentiveSlabs();
  return normalizeSlabRows(slabs);
}
