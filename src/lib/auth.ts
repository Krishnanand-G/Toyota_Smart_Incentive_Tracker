import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthProfile = {
  id: string;
  authId: string;
  email: string;
  fullName: string | null;
  officerId: string | null;
  photoUrl: string | null;
  role: Role;
};

const profileSelect = {
  id: true,
  authId: true,
  email: true,
  fullName: true,
  officerId: true,
  photoUrl: true,
  role: true,
  isActive: true,
} as const;

export const getAuthProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  let profile = await prisma.user.findUnique({
    where: { authId: user.id },
    select: profileSelect,
  });

  if (profile) {
    if (!profile.isActive) return null;
    return profile;
  }

  const normalizedEmail = user.email?.toLowerCase();
  if (!normalizedEmail) return null;

  profile = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: profileSelect,
  });

  if (!profile || !profile.isActive) return null;

  const linked = await prisma.user.update({
    where: { id: profile.id },
    data: { authId: user.id },
    select: profileSelect,
  });

  if (!linked.isActive) return null;
  return linked;
});

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
