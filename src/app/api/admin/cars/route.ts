import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { carPayloadSchema } from "@/lib/validations/car";

export async function GET() {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const cars = await prisma.carModel.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const payload = await request.json();
  const parsed = carPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const car = await prisma.carModel.create({
    data: {
      name: parsed.data.name,
      imageUrl: parsed.data.imageUrl,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return NextResponse.json(car, { status: 201 });
}
