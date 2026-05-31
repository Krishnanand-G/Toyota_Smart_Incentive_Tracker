import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, zodValidationResponse } from "@/lib/api-errors";
import { getAdminOfficers } from "@/lib/admin-officers-data";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  createSupabaseOfficerUser,
  deleteSupabaseOfficerUser,
} from "@/lib/officer-auth";
import { generateOfficerPassword, hashPassword } from "@/lib/password";
import { hasSupabaseAdmin } from "@/lib/supabase/admin";
import { createOfficerSchema } from "@/lib/validations/officer";

export async function GET() {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    return NextResponse.json(await getAdminOfficers());
  } catch {
    return jsonError("Could not load sales officers", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const payload = await request.json();
  const parsed = createOfficerSchema.safeParse(payload);
  if (!parsed.success) {
    return zodValidationResponse(parsed.error);
  }

  const email = parsed.data.email.toLowerCase();
  const { fullName, officerId, photoUrl } = parsed.data;
  const password = generateOfficerPassword();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { officerId }],
    },
    select: { email: true, officerId: true },
  });

  if (existing?.email === email) {
    return jsonError("A user with this email already exists.", 409);
  }
  if (existing?.officerId === officerId) {
    return jsonError("This sales officer ID is already in use.", 409);
  }

  if (!hasSupabaseAdmin()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY is required to create sales officer login credentials. Add it to your .env file.",
      503,
    );
  }

  const authResult = await createSupabaseOfficerUser({
    authId: "",
    email,
    fullName,
    officerId,
    password,
  });

  if (!authResult.ok) {
    return jsonError(authResult.error, 502);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        authId: authResult.authId,
        email,
        fullName,
        officerId,
        photoUrl: photoUrl ?? null,
        passwordHash,
        role: Role.OFFICER,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        officerId: user.officerId,
        photoUrl: user.photoUrl,
        hasPassword: true,
        authLinked: true,
      },
      { status: 201 },
    );
  } catch {
    await deleteSupabaseOfficerUser(authResult.authId);
    return jsonError("Could not create sales officer", 500);
  }
}
