import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getActiveCars = unstable_cache(
  async () =>
    prisma.carModel.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, imageUrl: true },
    }),
  ["active-cars"],
  { revalidate: 120, tags: ["active-cars"] },
);
