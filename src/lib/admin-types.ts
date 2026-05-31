export type OfficerSummary = {
  id: string;
  email: string;
  fullName: string | null;
  officerId: string | null;
  photoUrl: string | null;
  totalSales: number;
  thisMonthSales: number;
  activeMonths: number;
  latestMonth: string | null;
};

export type OfficerStatsRow = {
  userId: string;
  totalSales: bigint;
  thisMonthSales: bigint;
  activeMonths: bigint;
  latestMonth: string | null;
};

export type AdminSaleEntryRow = {
  id: string;
  soldAt: Date;
  userId: string;
  user: { fullName: string | null; email: string };
  carModel: { name: string };
};
