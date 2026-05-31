import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { requireRole } from "@/lib/auth";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function POST(request: Request) {
  try {
    const auth = await requireRole(Role.ADMIN);
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("No file uploaded.", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("Upload a JPG, PNG, or WebP image.", 400);
    }

    if (file.size > MAX_BYTES) {
      return jsonError("Image must be 2 MB or smaller.", 400);
    }

    const extension = ALLOWED_TYPES.get(file.type)!;
    const filename = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "officers");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/officers/${filename}` });
  } catch {
    return jsonError("Could not upload photo", 500);
  }
}
