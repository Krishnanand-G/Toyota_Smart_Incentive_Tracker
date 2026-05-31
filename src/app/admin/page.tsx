import { AdminDashboardClient } from "@/app/admin/admin-dashboard-client";
import { getCachedAdminDashboard } from "@/lib/admin-dashboard-data";
import { monthKeyFromDate } from "@/lib/sale-entry-utils";

export default async function AdminDashboardPage() {
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
