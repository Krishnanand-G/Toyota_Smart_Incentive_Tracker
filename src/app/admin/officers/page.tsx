import { AdminOfficersClient } from "@/app/admin/officers/admin-officers-client";
import { getAdminOfficers } from "@/lib/admin-officers-data";

export default async function AdminOfficersPage() {
  const initialOfficers = await getAdminOfficers();
  return <AdminOfficersClient initialOfficers={initialOfficers} />;
}
