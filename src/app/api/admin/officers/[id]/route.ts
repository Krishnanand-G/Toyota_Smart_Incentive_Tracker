import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  getSupabaseAuthStatus,
  persistOfficerPassword,
  provisionOrUpdateOfficerAuth,
  updateSupabaseOfficerUser,
} from "@/lib/officer-auth";
import { hasSupabaseAdmin } from "@/lib/supabase/admin";
import { updateOfficerSchema } from "@/lib/validations/officer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const officer = await prisma.user.findFirst({
    where: { id, role: Role.OFFICER, isActive: true },
    select: {
      id: true,
      email: true,
      fullName: true,
      officerId: true,
      photoUrl: true,
      passwordHash: true,
      authId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!officer) {
    return NextResponse.json({ error: "Sales officer not found." }, { status: 404 });
  }

  const authStatus = await getSupabaseAuthStatus(officer.authId);

  return NextResponse.json({
    id: officer.id,
    email: officer.email,
    fullName: officer.fullName,
    officerId: officer.officerId,
    photoUrl: officer.photoUrl,
    hasPassword: Boolean(officer.passwordHash),
    authLinked: authStatus.linked,
    authConfigured: authStatus.configured,
    createdAt: officer.createdAt.toISOString(),
    updatedAt: officer.updatedAt.toISOString(),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = updateOfficerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const officer = await prisma.user.findFirst({
    where: { id, role: Role.OFFICER, isActive: true },
  });

  if (!officer) {
    return NextResponse.json({ error: "Sales officer not found." }, { status: 404 });
  }

  const email = parsed.data.email?.toLowerCase();
  const { fullName, officerId, newPassword, photoUrl } = parsed.data;
  const nextEmail = email ?? officer.email;
  const nextFullName = fullName ?? officer.fullName;
  const nextOfficerId = officerId ?? officer.officerId;

  if (email && email !== officer.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    });
    if (emailTaken) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
  }

  if (officerId && officerId !== officer.officerId) {
    const idTaken = await prisma.user.findFirst({
      where: { officerId, NOT: { id } },
      select: { id: true },
    });
    if (idTaken) {
      return NextResponse.json({ error: "This sales officer ID is already in use." }, { status: 409 });
    }
  }

  if (newPassword) {
    await persistOfficerPassword(officer.id, newPassword);

    const authResult = await provisionOrUpdateOfficerAuth(
      {
        id: officer.id,
        authId: officer.authId,
        email: nextEmail,
        fullName: nextFullName,
        officerId: nextOfficerId,
        passwordHash: officer.passwordHash,
      },
      newPassword,
      nextEmail,
    );

    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 502 });
    }
  } else if (
    hasSupabaseAdmin() &&
    (email !== officer.email ||
      fullName !== officer.fullName ||
      officerId !== officer.officerId)
  ) {
    const authResult = await updateSupabaseOfficerUser(officer.authId, {
      email: nextEmail,
      fullName: nextFullName,
      officerId: nextOfficerId,
    });

    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 502 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(email ? { email } : {}),
      ...(fullName !== undefined ? { fullName } : {}),
      ...(officerId !== undefined ? { officerId } : {}),
      ...(photoUrl !== undefined ? { photoUrl } : {}),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      officerId: true,
      photoUrl: true,
      passwordHash: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    officerId: updated.officerId,
    photoUrl: updated.photoUrl,
    hasPassword: Boolean(updated.passwordHash),
    updatedAt: updated.updatedAt.toISOString(),
  });
}
