import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { carPayloadSchema } from "@/lib/validations/car";

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

  const updated = await prisma.carModel.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      imageUrl: parsed.data.imageUrl,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
      isActive: true,
      deletedAt: null,
    },
  });

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

  return NextResponse.json(deleted);
}
