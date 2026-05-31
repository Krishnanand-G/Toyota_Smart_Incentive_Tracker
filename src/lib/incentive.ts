import type { SlabShape, PayoutResult } from "@/lib/incentive-types";

export function getSlabIndex(totalUnits: number, slabs: SlabShape[]): number {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  if (!ordered.length) return -1;

  const index = ordered.findIndex(
    (slab) =>
      totalUnits >= slab.minUnits && (slab.maxUnits === null || totalUnits <= slab.maxUnits),
  );
  return index;
}

export function calculateIncentive(totalUnits: number, slabs: SlabShape[]): PayoutResult {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  const current = ordered.find(
    (slab) => totalUnits >= slab.minUnits && (slab.maxUnits === null || totalUnits <= slab.maxUnits),
  );

  if (!current) {
    const next = ordered.find((slab) => slab.minUnits > totalUnits);
    return {
      totalUnits,
      slabLabel: ordered.length ? "No tier" : "No slab configured",
      perUnitAmount: 0,
      totalPayout: 0,
      nextTierDeltaUnits: next ? Math.max(next.minUnits - totalUnits, 0) : null,
    };
  }

  const perUnit = Number(current.perUnitAmount);
  const totalPayout = totalUnits * perUnit;
  const next = ordered.find((slab) => slab.minUnits > totalUnits);

  return {
    totalUnits,
    slabLabel:
      current.label ??
      `${current.minUnits}-${current.maxUnits === null ? "∞" : current.maxUnits} units`,
    perUnitAmount: perUnit,
    totalPayout,
    nextTierDeltaUnits: next ? Math.max(next.minUnits - totalUnits, 0) : null,
  };
}
