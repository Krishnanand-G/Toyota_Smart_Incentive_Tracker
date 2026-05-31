import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, zodValidationResponse } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateSupabaseOfficerUser } from "@/lib/officer-auth";
import { hasSupabaseAdmin } from "@/lib/supabase/admin";
import { updateOfficerSchema } from "@/lib/validations/officer";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const payload = await request.json();
    const parsed = updateOfficerSchema.safeParse(payload);
    if (!parsed.success) {
      return zodValidationResponse(parsed.error);
    }

    const officer = await prisma.user.findFirst({
      where: { id, role: Role.OFFICER, isActive: true },
    });

    if (!officer) {
      return jsonError("Sales officer not found.", 404);
    }

    const email = parsed.data.email?.toLowerCase();
    const { fullName, officerId, photoUrl } = parsed.data;
    const nextEmail = email ?? officer.email;
    const nextFullName = fullName ?? officer.fullName;
    const nextOfficerId = officerId ?? officer.officerId;

    if (email && email !== officer.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email, NOT: { id } },
        select: { id: true },
      });
      if (emailTaken) {
        return jsonError("A user with this email already exists.", 409);
      }
    }

    if (officerId && officerId !== officer.officerId) {
      const idTaken = await prisma.user.findFirst({
        where: { officerId, NOT: { id } },
        select: { id: true },
      });
      if (idTaken) {
        return jsonError("This sales officer ID is already in use.", 409);
      }
    }

    if (
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
        return jsonError(authResult.error, 502);
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
        updatedAt: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      officerId: updated.officerId,
      photoUrl: updated.photoUrl,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch {
    return jsonError("Could not update sales officer", 500);
  }
}
