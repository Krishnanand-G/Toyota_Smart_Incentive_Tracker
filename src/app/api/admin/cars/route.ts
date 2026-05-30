import { composeCarDisplayName } from "@/lib/car-model-utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { carPayloadSchema } from "@/lib/validations/car";
import { Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function carDataFromPayload(data: {
  modelName: string;
  baseSuffix?: string;
  variant?: string;
  imageUrl: string;
  description?: string;
}) {
  const baseSuffix = data.baseSuffix || null;
  const variant = data.variant || null;
  return {
    modelName: data.modelName,
    baseSuffix,
    variant,
    name: composeCarDisplayName(data.modelName, baseSuffix, variant),
    imageUrl: data.imageUrl,
    description: data.description || null,
  };
}

export async function GET(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  const cars = await prisma.carModel.findMany({
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
    data: carDataFromPayload(parsed.data),
  });

  revalidateTag("active-cars");

  return NextResponse.json(car, { status: 201 });
}
