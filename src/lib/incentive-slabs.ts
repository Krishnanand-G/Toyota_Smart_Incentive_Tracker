import type { SlabShape } from "@/lib/incentive-types";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getIncentiveSlabs = unstable_cache(
  async () => prisma.incentiveSlab.findMany({ orderBy: { minUnits: "asc" } }),
  ["incentive-slabs"],
  { revalidate: 300, tags: ["incentive-slabs"] },
);

export async function getIncentiveSlabShapes(): Promise<SlabShape[]> {
  const slabs = await getIncentiveSlabs();
  return slabs.map((slab) => ({
    minUnits: slab.minUnits,
    maxUnits: slab.maxUnits,
    perUnitAmount: Number(slab.perUnitAmount),
    label: slab.label,
  }));
}
