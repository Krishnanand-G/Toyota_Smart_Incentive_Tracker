import { getAuthProfile } from "@/lib/auth";
import { PORTAL_ROLE_COOKIE, type PortalRole } from "@/lib/auth-cookie";
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
    const profile = await getAuthProfile();

    if (!profile) {
      const response = NextResponse.json({ error: "User profile not found" }, { status: 404 });
      response.cookies.set(PORTAL_ROLE_COOKIE, "", { maxAge: 0, path: "/" });
      return response;
    }

    return attachPortalRoleCookie(NextResponse.json(profile), profile.role);
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
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
