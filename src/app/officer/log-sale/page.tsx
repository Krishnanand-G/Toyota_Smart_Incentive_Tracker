import { LogSalePageClient } from "@/app/officer/log-sale/log-sale-page-client";
import { getAuthProfile } from "@/lib/auth";
import { getActiveCars } from "@/lib/catalog-cache";
import { currentMonthKey } from "@/lib/date-picker-utils";
import { getCachedOfficerDashboard } from "@/lib/officer-dashboard-data";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function OfficerLogSalePage() {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== Role.OFFICER) {
    redirect("/");
  }

  const initialMonthKey = currentMonthKey();
  const [cars, dashboard] = await Promise.all([
    getActiveCars(),
    getCachedOfficerDashboard(profile.id, initialMonthKey),
  ]);

  return (
    <LogSalePageClient
      initialMonthKey={initialMonthKey}
      initialCars={cars}
      initialEntries={dashboard.entries}
      initialPayout={dashboard.payout}
      initialTotalUnits={dashboard.totalUnits}
    />
  );
}
