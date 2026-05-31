import { OfficerDashboardClient } from "@/app/officer/officer-dashboard-client";
import { getAuthProfile } from "@/lib/auth";
import { currentMonthKey } from "@/lib/date-picker-utils";
import { getCachedOfficerDashboard } from "@/lib/officer-dashboard-data";

export default async function OfficerDashboardPage() {
  const profile = await getAuthProfile();
  const initialMonthKey = currentMonthKey();
  const initialData = await getCachedOfficerDashboard(profile!.id, initialMonthKey);

  return (
    <OfficerDashboardClient initialData={initialData} initialMonthKey={initialMonthKey} />
  );
}
