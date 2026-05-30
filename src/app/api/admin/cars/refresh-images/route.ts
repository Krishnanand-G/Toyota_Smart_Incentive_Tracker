import { fetchCarwaleImageForModel } from "@/lib/carwale-image";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const cars = await prisma.carModel.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const results: { id: string; modelName: string; updated: boolean; imageUrl?: string; error?: string }[] =
    [];

  for (const car of cars) {
    try {
      const imageUrl = await fetchCarwaleImageForModel(car.modelName);
      if (!imageUrl) {
        results.push({ id: car.id, modelName: car.modelName, updated: false, error: "No image found" });
        continue;
      }
      if (car.imageUrl === imageUrl) {
        results.push({ id: car.id, modelName: car.modelName, updated: false, imageUrl });
        continue;
      }
      await prisma.carModel.update({ where: { id: car.id }, data: { imageUrl } });
      results.push({ id: car.id, modelName: car.modelName, updated: true, imageUrl });
    } catch {
      results.push({ id: car.id, modelName: car.modelName, updated: false, error: "Fetch failed" });
    }
  }

  revalidateTag("active-cars");

  const updated = await prisma.carModel.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    updatedCount: results.filter((r) => r.updated).length,
    results,
    cars: updated,
  });
}
