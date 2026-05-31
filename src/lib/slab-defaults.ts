import type { SlabShape } from "@/lib/incentive-types";

export const DEFAULT_INCENTIVE_SLABS: SlabShape[] = [
  { minUnits: 0, maxUnits: 9, perUnitAmount: 1000, label: "Standard" },
  { minUnits: 10, maxUnits: 19, perUnitAmount: 1400, label: "Target" },
  { minUnits: 20, maxUnits: 29, perUnitAmount: 1800, label: "Stretch" },
  { minUnits: 30, maxUnits: null, perUnitAmount: 2200, label: "Excellence" },
];

export function normalizeSlabRows(
  slabs: Array<{
    id?: string;
    minUnits: number;
    maxUnits: number | null;
    perUnitAmount: number | string | { toString(): string };
    label: string | null;
  }>,
): SlabShape[] {
  return [...slabs]
    .sort((a, b) => a.minUnits - b.minUnits)
    .map((slab) => ({
      id: slab.id,
      minUnits: slab.minUnits,
      maxUnits: slab.maxUnits,
      perUnitAmount: Number(slab.perUnitAmount),
      label: slab.label ?? "",
    }));
}
