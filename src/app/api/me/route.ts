import { getAuthProfile } from "@/lib/auth";
import { PORTAL_ROLE_COOKIE, type PortalRole } from "@/lib/auth-cookie";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function attachPortalRoleCookie(response: NextResponse, role: PortalRole) {
  response.cookies.set(PORTAL_ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not signed in",
          code: "NO_SESSION",
          hint: "Supabase session was not found on the server. Finish Step 7 (Supabase URL Configuration) and try again.",
        },
        { status: 401 },
      );
    }

    const profile = await getAuthProfile();

    if (!profile) {
      const response = NextResponse.json(
        {
          error: "User profile not found",
          code: "NO_PROFILE",
          email: user.email,
          hint: "Supabase sign-in worked, but this email is missing from the app database. Run npm run prisma:seed using the same DATABASE_URL as Vercel, then confirm admin@toyota.local exists in Supabase Table Editor → User.",
        },
        { status: 404 },
      );
      response.cookies.set(PORTAL_ROLE_COOKIE, "", { maxAge: 0, path: "/" });
      return response;
    }

    return attachPortalRoleCookie(NextResponse.json(profile), profile.role);
  } catch (error) {
    console.error("[GET /api/me]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        code: "DB_ERROR",
        hint: "The server could not reach PostgreSQL. On Vercel, set DATABASE_URL to your Supabase connection string (Transaction pooler, port 6543).",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const profile = await getAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_ROLE_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
