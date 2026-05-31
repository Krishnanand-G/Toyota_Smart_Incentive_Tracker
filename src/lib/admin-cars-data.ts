import { prisma } from "@/lib/prisma";

export async function getAdminCarModels(query?: string) {
  const q = query?.trim().toLowerCase();

  return prisma.carModel.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { modelName: { contains: q, mode: "insensitive" } },
              { variant: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });
}
