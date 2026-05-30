import { PrismaClient } from "@prisma/client";
import { fetchCarwaleImageForModel } from "../src/lib/carwale-image";

const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.carModel.findMany({
    where: { isActive: true },
    select: { id: true, modelName: true, imageUrl: true },
  });

  for (const car of cars) {
    const imageUrl = await fetchCarwaleImageForModel(car.modelName);
    if (!imageUrl) {
      console.log(`SKIP ${car.modelName} — no CarWale image`);
      continue;
    }
    if (car.imageUrl === imageUrl) {
      console.log(`OK   ${car.modelName} — already up to date`);
      continue;
    }
    await prisma.carModel.update({
      where: { id: car.id },
      data: { imageUrl },
    });
    console.log(`UPD  ${car.modelName}`);
    console.log(`     ${imageUrl}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
