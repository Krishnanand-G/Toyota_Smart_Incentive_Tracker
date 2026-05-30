import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";

type OfficerAuthProfile = {
  authId: string;
  email: string;
  fullName: string | null;
  officerId: string | null;
};

export async function getSupabaseAuthStatus(authId: string) {
  if (!hasSupabaseAdmin()) {
    return { linked: false, configured: false };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(authId);
  if (error || !data.user) {
    return { linked: false, configured: true };
  }

  return { linked: true, configured: true, email: data.user.email ?? null };
}

export async function createSupabaseOfficerUser(
  profile: OfficerAuthProfile & { password: string },
) {
  if (!hasSupabaseAdmin()) {
    return {
      ok: false as const,
      error: "SUPABASE_SERVICE_ROLE_KEY is required to create login credentials.",
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: profile.email,
    password: profile.password,
    email_confirm: true,
    user_metadata: {
      full_name: profile.fullName,
      officer_id: profile.officerId,
    },
  });

  if (error || !data.user) {
    return { ok: false as const, error: error?.message ?? "Could not create Supabase auth user." };
  }

  return { ok: true as const, authId: data.user.id };
}

export async function updateSupabaseOfficerUser(
  authId: string,
  updates: {
    email?: string;
    password?: string;
    fullName?: string | null;
    officerId?: string | null;
  },
) {
  if (!hasSupabaseAdmin()) {
    return {
      ok: false as const,
      error: "SUPABASE_SERVICE_ROLE_KEY is required to update login credentials.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(authId, {
    ...(updates.email ? { email: updates.email } : {}),
    ...(updates.password ? { password: updates.password } : {}),
    user_metadata: {
      full_name: updates.fullName,
      officer_id: updates.officerId,
    },
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export async function provisionOrUpdateOfficerAuth(
  officer: OfficerAuthProfile & { id: string; passwordHash: string | null },
  password: string,
  email?: string,
) {
  const authStatus = await getSupabaseAuthStatus(officer.authId);

  if (authStatus.linked) {
    const result = await updateSupabaseOfficerUser(officer.authId, {
      email: email ?? officer.email,
      password,
      fullName: officer.fullName,
      officerId: officer.officerId,
    });
    if (!result.ok) return result;
    return { ok: true as const, authId: officer.authId };
  }

  const created = await createSupabaseOfficerUser({
    authId: officer.authId,
    email: email ?? officer.email,
    fullName: officer.fullName,
    officerId: officer.officerId,
    password,
  });

  if (!created.ok) return created;

  await prisma.user.update({
    where: { id: officer.id },
    data: { authId: created.authId },
  });

  return { ok: true as const, authId: created.authId };
}

export async function persistOfficerPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
