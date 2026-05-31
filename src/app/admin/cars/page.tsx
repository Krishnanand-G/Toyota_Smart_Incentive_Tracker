import { AdminCarsClient } from "@/app/admin/cars/admin-cars-client";
import { getAdminCarModels } from "@/lib/admin-cars-data";

export default async function AdminCarsPage() {
  const initialCars = await getAdminCarModels();
  return <AdminCarsClient initialCars={initialCars} />;
}
