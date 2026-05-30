import { composeCarDisplayName } from "@/lib/car-model-utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { carPayloadSchema } from "@/lib/validations/car";
import { Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const payload = await request.json();
  const parsed = carPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const baseSuffix = parsed.data.baseSuffix || null;
  const variant = parsed.data.variant || null;

  const updated = await prisma.carModel.update({
    where: { id: params.id },
    data: {
      modelName: parsed.data.modelName,
      baseSuffix,
      variant,
      name: composeCarDisplayName(parsed.data.modelName, baseSuffix, variant),
      imageUrl: parsed.data.imageUrl,
      description: parsed.data.description || null,
      isActive: true,
      deletedAt: null,
    },
  });

  revalidateTag("active-cars");

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const deleted = await prisma.carModel.update({
    where: { id: params.id },
    data: { isActive: false, deletedAt: new Date() },
  });

  revalidateTag("active-cars");

  return NextResponse.json(deleted);
}
