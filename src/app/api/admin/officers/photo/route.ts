import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { requireRole } from "@/lib/auth";
import { getOfficerPhotoExtension, saveOfficerPhoto } from "@/lib/officer-photo-storage";

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("No file uploaded.", 400);
    }

    if (!getOfficerPhotoExtension(file.type)) {
      return jsonError("Upload a JPG, PNG, or WebP image.", 400);
    }

    if (file.size > MAX_BYTES) {
      return jsonError("Image must be 2 MB or smaller.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveOfficerPhoto(buffer, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload photo";
    console.error("[POST /api/admin/officers/photo]", error);
    return jsonError(message, 500);
  }
}
