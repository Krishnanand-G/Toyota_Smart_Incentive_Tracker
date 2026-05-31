import { Prisma, Role } from "@prisma/client";
import { composeCarDisplayName } from "../src/lib/car-model-utils";
import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

const DEMO_OFFICER_PASSWORD = "officer123";

const CAR_DEMAND: Record<string, number> = {
  "urban-cruiser-hyryder-1-5-s-hybrid": 28,
  "glanza-1-2-v-mt": 24,
  "innova-crysta-2-4-gx-7str": 16,
  "innova-hycross-2-0-zx-hybrid": 14,
  "hilux-2-8-4x4-mt": 9,
  "camry-hybrid-ecvt": 5,
};

type SeedOfficer = {
  authId: string;
  email: string;
  fullName: string;
  officerId: string;
  monthlyBase: number;
  monthlyVariance: number;
};

function pickWeightedCar(carIds: string[]): string {
  const weights = carIds.map((id) => CAR_DEMAND[id] ?? 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < carIds.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return carIds[i];
  }
  return carIds[carIds.length - 1];
}

function weekdaySaleDays(year: number, month: number, count: number): number[] {
  const candidates: number[] = [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    if (dow !== 0) candidates.push(day);
  }

  const picked: number[] = [];
  const pool = [...candidates];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function saleTimestamp(year: number, month: number, day: number): Date {
  const hour = 10 + Math.floor(Math.random() * 8);
  const minute = Math.floor(Math.random() * 60);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute, 0, 0));
}

async function main() {
  const seedUsers = [
    {
      authId: "00000000-0000-0000-0000-000000000001",
      email: "admin@toyota.local",
      fullName: "Demo Admin",
      role: Role.ADMIN,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  const officers: SeedOfficer[] = [
    {
      authId: "00000000-0000-0000-0000-000000000003",
      email: "krishnanand.g@toyota.local",
      fullName: "Krishnanand G",
      officerId: "SO-001",
      monthlyBase: 15,
      monthlyVariance: 3,
    },
    {
      authId: "00000000-0000-0000-0000-000000000002",
      email: "officer@toyota.local",
      fullName: "Demo Sales Officer",
      officerId: "SO-002",
      monthlyBase: 8,
      monthlyVariance: 2,
    },
  ];

  await prisma.user.updateMany({
    where: {
      role: Role.OFFICER,
      email: { notIn: officers.map((officer) => officer.email) },
    },
    data: { isActive: false, officerId: null },
  });

  const officerRecords = [];
  const demoPasswordHash = await hashPassword(DEMO_OFFICER_PASSWORD);
  for (const officer of officers) {
    const record = await prisma.user.upsert({
      where: { email: officer.email },
      update: {
        authId: officer.authId,
        fullName: officer.fullName,
        officerId: officer.officerId,
        role: Role.OFFICER,
        isActive: true,
        passwordHash: demoPasswordHash,
      },
      create: {
        authId: officer.authId,
        email: officer.email,
        fullName: officer.fullName,
        officerId: officer.officerId,
        role: Role.OFFICER,
        isActive: true,
        passwordHash: demoPasswordHash,
      },
    });
    officerRecords.push({ ...officer, id: record.id });
  }

  await prisma.user.updateMany({
    where: {
      OR: [
        { photoUrl: { contains: "pravatar.cc" } },
        { photoUrl: { contains: "ui-avatars.com" } },
      ],
    },
    data: { photoUrl: null },
  });

  const admin = await prisma.user.findUniqueOrThrow({ where: { authId: seedUsers[0].authId } });

  const cars = [
    {
      id: "innova-crysta-2-4-gx-7str",
      modelName: "Innova Crysta",
      baseSuffix: "2.4 GX",
      variant: "7Str",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/140809/innova-crysta-exterior-right-front-three-quarter-3.png?isig=0&q=80",
      description:
        "Reliable MPV with a strong chassis, up to seven seats, ample storage, and a robust diesel engine for family and fleet use.",
    },
    {
      id: "innova-hycross-2-0-zx-hybrid",
      modelName: "Innova HyCross",
      baseSuffix: "2.0",
      variant: "ZX Hybrid 7-Seater",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/innova-hycross-exterior-right-front-three-quarter-74.png?isig=0&q=80",
      description:
        "Premium hybrid MPV with flexible seating, connected features, and strong demand across urban and highway markets.",
    },
    {
      id: "urban-cruiser-hyryder-1-5-s-hybrid",
      modelName: "Urban Cruiser Hyryder",
      baseSuffix: "1.5",
      variant: "S Hybrid",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/124027/hyryder-exterior-right-front-three-quarter-74.png?isig=0&q=80",
      description:
        "Compact SUV with strong hybrid efficiency, elevated ride height, and steady monthly volume in city showrooms.",
    },
    {
      id: "glanza-1-2-v-mt",
      modelName: "Glanza",
      baseSuffix: "1.2",
      variant: "V MT",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/112839/glanza-exterior-right-front-three-quarter-6.png?isig=0&q=80",
      description:
        "City-friendly hatchback with low running costs and consistent demand from first-time Toyota buyers.",
    },
    {
      id: "camry-hybrid-ecvt",
      modelName: "Camry",
      baseSuffix: "Hybrid",
      variant: "e-CVT",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/192443/camry-exterior-right-front-three-quarter-15.png?isig=0&q=80",
      description:
        "Premium hybrid sedan for executive buyers who want comfort, refinement, and strong brand pull.",
    },
    {
      id: "hilux-2-8-4x4-mt",
      modelName: "Hilux",
      baseSuffix: "2.8",
      variant: "4x4 MT",
      imageUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/109265/hilux-exterior-right-front-three-quarter-44.png?isig=0&q=80",
      description:
        "Rugged 4x4 pickup with a 2.8L diesel engine, popular across semi-urban and commercial buyer segments.",
    },
  ];

  await prisma.saleEntry.deleteMany();
  await prisma.monthlySaleItem.deleteMany();
  await prisma.monthlySale.deleteMany();
  await prisma.carModel.updateMany({
    data: { isActive: false, deletedAt: new Date() },
  });

  for (const car of cars) {
    const { id, ...fields } = car;
    const name = composeCarDisplayName(fields.modelName, fields.baseSuffix, fields.variant);
    await prisma.carModel.upsert({
      where: { id },
      update: { ...fields, name, isActive: true, deletedAt: null },
      create: { id, ...fields, name },
    });
  }

  await prisma.incentiveSlab.deleteMany();
  await prisma.incentiveSlab.createMany({
    data: [
      { minUnits: 0, maxUnits: 9, perUnitAmount: new Prisma.Decimal(1000), label: "Standard" },
      { minUnits: 10, maxUnits: 19, perUnitAmount: new Prisma.Decimal(1400), label: "Target" },
      { minUnits: 20, maxUnits: 29, perUnitAmount: new Prisma.Decimal(1800), label: "Stretch" },
      { minUnits: 30, maxUnits: null, perUnitAmount: new Prisma.Decimal(2200), label: "Excellence" },
    ],
  });

  const carRows = await prisma.carModel.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const carIds = carRows.map((car) => car.id);

  const now = new Date();
  const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const sampleMonths = ["2026-01", "2026-02", "2026-03", currentMonthKey];

  for (const officer of officerRecords) {
    for (const monthKey of sampleMonths) {
      const [year, month] = monthKey.split("-").map(Number);
      const isCurrentMonth = monthKey === currentMonthKey;
      const monthProgress = isCurrentMonth ? now.getUTCDate() / 28 : 1;
      const seasonalBoost = month === 3 ? 1.1 : month === 1 ? 0.92 : 1;
      const targetCount = Math.max(
        2,
        Math.round(
          (officer.monthlyBase +
            Math.floor(Math.random() * (officer.monthlyVariance * 2 + 1)) -
            officer.monthlyVariance) *
            seasonalBoost *
            monthProgress,
        ),
      );

      const days = weekdaySaleDays(year, month, targetCount);
      for (const day of days) {
        await prisma.saleEntry.create({
          data: {
            userId: officer.id,
            carModelId: pickWeightedCar(carIds),
            soldAt: saleTimestamp(year, month, day),
          },
        });
      }
    }
  }

  console.log(`Seed complete for admin: ${admin.email}`);
  console.log(
    `Sales officers: ${officerRecords.map((officer) => `${officer.fullName} (${officer.officerId})`).join(", ")}`,
  );
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
