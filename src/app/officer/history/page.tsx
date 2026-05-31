import { OfficerHistoryClient } from "@/components/officer/officer-history-client";
import { getAuthProfile } from "@/lib/auth";
import { getActiveCars } from "@/lib/catalog-cache";
import { currentMonthKey } from "@/lib/date-picker-utils";
import { getOfficerHistoryMonths } from "@/lib/officer-history-data";

export default async function OfficerHistoryPage() {
  const profile = await getAuthProfile();
  const [initialMonths, initialCars] = await Promise.all([
    getOfficerHistoryMonths(profile!.id),
    getActiveCars(),
  ]);

  return (
    <OfficerHistoryClient
      initialMonths={initialMonths}
      initialCars={initialCars}
      currentMonthKey={currentMonthKey()}
    />
  );
}
