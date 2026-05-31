import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const AUTH_PATHS = ["/admin", "/officer"];
const PUBLIC_AUTH_PATHS = ["/", "/login", "/login/admin", "/login/officer"];

function isProtectedPath(pathname: string) {
  return AUTH_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function getProfileRole(request: NextRequest) {
  const profileResponse = await fetch(new URL("/api/me", request.url), {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!profileResponse.ok) return null;
  return (await profileResponse.json()) as { role: "ADMIN" | "OFFICER" };
}

function portalForRole(role: "ADMIN" | "OFFICER") {
  return role === "ADMIN" ? "/admin" : "/officer";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && (isPublicAuthPath(pathname) || isProtectedPath(pathname))) {
    const profile = await getProfileRole(request);

    if (isPublicAuthPath(pathname) && profile) {
      return NextResponse.redirect(new URL(portalForRole(profile.role), request.url));
    }

    if (isProtectedPath(pathname)) {
      if (!profile) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (pathname.startsWith("/admin") && profile.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/officer", request.url));
      }

      if (pathname.startsWith("/officer") && profile.role !== "OFFICER") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/login/:path*", "/admin/:path*", "/officer/:path*"],
};
