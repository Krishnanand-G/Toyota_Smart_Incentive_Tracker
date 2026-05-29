import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/auth";

export async function GET() {
  try {
    const profile = await getAuthProfile();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
