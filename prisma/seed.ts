import { MonthlySaleStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  const seedUsers = [
    {
      authId: "00000000-0000-0000-0000-000000000001",
      email: "admin@toyota.local",
      fullName: "Demo Admin",
      role: Role.ADMIN,
    },
    {
      authId: "00000000-0000-0000-0000-000000000002",
      email: "officer@toyota.local",
      fullName: "Demo Officer",
      role: Role.OFFICER,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { authId: user.authId },
      update: user,
      create: user,
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { authId: seedUsers[0].authId } });
  const officer = await prisma.user.findUniqueOrThrow({ where: { authId: seedUsers[1].authId } });

  const cars = [
    {
      name: "Innova HyCross",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      description: "Premium MPV for family and fleet buyers.",
      sortOrder: 1,
    },
    {
      name: "Urban Cruiser Hyryder",
      imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
      description: "Mid-size SUV with hybrid options.",
      sortOrder: 2,
    },
    {
      name: "Fortuner",
      imageUrl: "https://images.unsplash.com/photo-1493238792000-8113da705763",
      description: "Flagship SUV with strong rural/urban demand.",
      sortOrder: 3,
    },
    {
      name: "Glanza",
      imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753",
      description: "City hatchback with steady monthly volume.",
      sortOrder: 4,
    },
  ];

  for (const car of cars) {
    await prisma.carModel.upsert({
      where: { id: `${car.name.toLowerCase().replaceAll(" ", "-")}` },
      update: car,
      create: { id: `${car.name.toLowerCase().replaceAll(" ", "-")}`, ...car },
    });
  }

  await prisma.incentiveSlab.deleteMany();
  await prisma.incentiveSlab.createMany({
    data: [
      { minUnits: 0, maxUnits: 9, perUnitAmount: new Prisma.Decimal(1000), label: "Starter" },
      { minUnits: 10, maxUnits: 19, perUnitAmount: new Prisma.Decimal(1400), label: "Growth" },
      { minUnits: 20, maxUnits: 29, perUnitAmount: new Prisma.Decimal(1800), label: "Momentum" },
      { minUnits: 30, maxUnits: null, perUnitAmount: new Prisma.Decimal(2200), label: "Champion" },
    ],
  });

  const carRows = await prisma.carModel.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const sampleMonths = ["2026-01", "2026-02", "2026-03"];
  for (const [index, monthKey] of sampleMonths.entries()) {
    const items = carRows.map((car, i) => ({
      carModelId: car.id,
      units: i + 1 + index,
    }));
    const totalUnits = items.reduce((sum, item) => sum + item.units, 0);
    await prisma.monthlySale.upsert({
      where: { userId_monthKey: { userId: officer.id, monthKey } },
      update: {
        status: MonthlySaleStatus.SUBMITTED,
        submittedAt: new Date(),
        totalUnits,
        totalIncentive: new Prisma.Decimal(totalUnits * 1400),
      },
      create: {
        userId: officer.id,
        monthKey,
        status: MonthlySaleStatus.SUBMITTED,
        submittedAt: new Date(),
        totalUnits,
        totalIncentive: new Prisma.Decimal(totalUnits * 1400),
        items: {
          create: items,
        },
      },
    });
  }

  console.log(`Seed complete for users: ${admin.email}, ${officer.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
