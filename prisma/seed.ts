import { Role } from "@prisma/client";
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
