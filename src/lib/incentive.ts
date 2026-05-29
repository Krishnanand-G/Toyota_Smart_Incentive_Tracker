import type { SlabShape } from "@/lib/incentive-types";

export type IncentiveResult = {
  totalUnits: number;
  slabLabel: string;
  perUnitAmount: number;
  totalPayout: number;
  nextTierDeltaUnits: number | null;
};

export function calculateIncentive(totalUnits: number, slabs: SlabShape[]): IncentiveResult {
  const ordered = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
  const current =
    ordered.find((slab) => totalUnits >= slab.minUnits && (slab.maxUnits === null || totalUnits <= slab.maxUnits)) ??
    ordered[0];

  if (!current) {
    return {
      totalUnits,
      slabLabel: "No slab configured",
      perUnitAmount: 0,
      totalPayout: 0,
      nextTierDeltaUnits: null,
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
