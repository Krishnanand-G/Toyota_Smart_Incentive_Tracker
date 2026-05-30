import { AdminDashboardClient } from "@/app/admin/admin-dashboard-client";
import { getAuthProfile } from "@/lib/auth";
import { getCachedAdminDashboard } from "@/lib/admin-dashboard-data";
import { monthKeyFromDate } from "@/lib/sale-entry-utils";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== Role.ADMIN) {
    redirect("/");
  }

  const initialMonthKey = monthKeyFromDate(new Date());
  const initialData = await getCachedAdminDashboard("month", initialMonthKey);

  return (
    <AdminDashboardClient
      initialData={initialData}
      initialRange="month"
      initialMonthKey={initialMonthKey}
    />
  );
}
