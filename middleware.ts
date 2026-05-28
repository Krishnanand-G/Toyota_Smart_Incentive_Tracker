import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const AUTH_PATHS = ["/admin", "/officer"];

function isProtectedPath(pathname: string) {
  return AUTH_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    const profileResponse = await fetch(new URL("/api/me", request.url), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (profileResponse.ok) {
      const profile = (await profileResponse.json()) as { role: "ADMIN" | "OFFICER" };
      const destination = profile.role === "ADMIN" ? "/admin" : "/officer";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  if (user && isProtectedPath(pathname)) {
    const profileResponse = await fetch(new URL("/api/me", request.url), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (profileResponse.ok) {
      const profile = (await profileResponse.json()) as { role: "ADMIN" | "OFFICER" };
      if (pathname.startsWith("/admin") && profile.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/officer", request.url));
      }

      if (pathname.startsWith("/officer") && profile.role !== "OFFICER") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/officer/:path*"],
};
