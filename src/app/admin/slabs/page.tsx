import { AdminSlabsClient } from "@/app/admin/admin-slabs-client";
import { getAdminSlabRows } from "@/lib/admin-slabs-data";

export default async function AdminSlabsPage() {
  const initialSlabs = await getAdminSlabRows();

  return <AdminSlabsClient initialSlabs={initialSlabs} />;
}
