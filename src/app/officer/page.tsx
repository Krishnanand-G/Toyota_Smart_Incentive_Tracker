import { OfficerDashboardClient } from "@/app/officer/officer-dashboard-client";
import { getAuthProfile } from "@/lib/auth";
import { currentMonthKey } from "@/lib/date-picker-utils";
import { getCachedOfficerDashboard } from "@/lib/officer-dashboard-data";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function OfficerDashboardPage() {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== Role.OFFICER) {
    redirect("/");
  }

  const initialMonthKey = currentMonthKey();
  const initialData = await getCachedOfficerDashboard(profile.id, initialMonthKey);

  return (
    <OfficerDashboardClient initialData={initialData} initialMonthKey={initialMonthKey} />
  );
}
