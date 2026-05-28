import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthProfile = {
  id: string;
  authId: string;
  email: string;
  fullName: string | null;
  role: Role;
};

export async function getAuthProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      id: true,
      authId: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  return profile;
}

export async function requireAuth() {
  const profile = await getAuthProfile();
  if (!profile) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      profile: null as AuthProfile | null,
    };
  }

  return { error: null, profile };
}

export async function requireRole(role: Role) {
  const auth = await requireAuth();
  if (auth.error || !auth.profile) return auth;

  if (auth.profile.role !== role) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      profile: null as AuthProfile | null,
    };
  }

  return auth;
}
