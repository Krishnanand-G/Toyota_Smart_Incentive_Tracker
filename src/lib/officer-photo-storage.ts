import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";

export const OFFICER_PHOTO_BUCKET = "officer-photos";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export function getOfficerPhotoExtension(mimeType: string): string | null {
  return ALLOWED_TYPES.get(mimeType) ?? null;
}

function shouldUseSupabaseStorage() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

async function ensureOfficerPhotoBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets?.some((bucket) => bucket.name === OFFICER_PHOTO_BUCKET)) {
    return supabase;
  }

  const { error: createError } = await supabase.storage.createBucket(OFFICER_PHOTO_BUCKET, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError;
  }

  return supabase;
}

async function uploadToSupabase(buffer: Buffer, filename: string, mimeType: string) {
  const supabase = await ensureOfficerPhotoBucket();
  const { error } = await supabase.storage.from(OFFICER_PHOTO_BUCKET).upload(filename, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(OFFICER_PHOTO_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

async function uploadToLocalDisk(buffer: Buffer, filename: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "officers");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/officers/${filename}`;
}

export async function saveOfficerPhoto(buffer: Buffer, mimeType: string): Promise<string> {
  const extension = getOfficerPhotoExtension(mimeType);
  if (!extension) {
    throw new Error("Upload a JPG, PNG, or WebP image.");
  }

  const filename = `${randomUUID()}${extension}`;

  if (shouldUseSupabaseStorage()) {
    if (!hasSupabaseAdmin()) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is required to upload photos on the live site. Add it in Vercel environment variables.",
      );
    }
    return uploadToSupabase(buffer, filename, mimeType);
  }

  return uploadToLocalDisk(buffer, filename);
}
