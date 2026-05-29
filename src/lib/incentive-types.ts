export type SlabShape = {
  id?: string;
  minUnits: number;
  maxUnits: number | null;
  perUnitAmount: number | string | { toString(): string };
  label: string | null;
};

export type PayoutResult = {
  totalUnits: number;
  slabLabel: string;
  perUnitAmount: number;
  totalPayout: number;
  nextTierDeltaUnits: number | null;
};
