export type CarModelOption = {
  id: string;
  name: string;
  imageUrl: string;
};

export type OfficerSaleEntryDisplay = {
  id: string;
  carName: string;
  carImageUrl: string;
  soldAt: string;
};

export type EditableSaleEntry = {
  id: string;
  carModelId: string;
  carName: string;
  soldAt: string;
};

export type LogSaleSuccessResult = {
  entry: { carName: string; soldAt: string };
  tierUnlocked: boolean;
  tierLabel: string | null;
  payout: { slabLabel: string; perUnitAmount: number; totalPayout: number };
};
