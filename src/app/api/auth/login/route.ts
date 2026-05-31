import { getAuthProfile } from "@/lib/auth";
import { PORTAL_ROLE_COOKIE, type PortalRole } from "@/lib/auth-cookie";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type LoginBody = {
  email?: string;
  password?: string;
  expectedRole?: PortalRole;
};

function roleLabel(role: PortalRole) {
  return role === "ADMIN" ? "admin" : "sales officer";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const expectedRole = body.expectedRole;

    if (!email || !password || (expectedRole !== "ADMIN" && expectedRole !== "OFFICER")) {
      return NextResponse.json({ error: "Email, password, and portal are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 401 });
    }

    const profile = await getAuthProfile();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error: "User profile not found",
          hint: "Supabase accepted the password, but this email is missing from the app database (or is inactive). Confirm the row exists in Supabase Table Editor → User and that Vercel DATABASE_URL uses the Transaction pooler URL (port 6543).",
        },
        { status: 404 },
      );
    }

    if (profile.role !== expectedRole) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error: `This account is not a ${roleLabel(expectedRole)}. Use the correct portal to sign in.`,
        },
        { status: 403 },
      );
    }

    const redirectPath = expectedRole === "ADMIN" ? "/admin" : "/officer";
    const response = NextResponse.json({ ok: true, redirectPath });

    response.cookies.set(PORTAL_ROLE_COOKIE, profile.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      {
        error: "Login failed",
        hint: "Could not reach the database. Set Vercel DATABASE_URL to your Supabase Transaction pooler string and add ?pgbouncer=true at the end if it is missing.",
      },
      { status: 500 },
    );
  }
}
