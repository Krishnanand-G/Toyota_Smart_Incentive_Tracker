const PLACEHOLDER_HOSTS = ["i.pravatar.cc", "ui-avatars.com", "avatar.iran.liara.run"];

/** Returns a displayable photo URL, or null for stock/placeholder images. */
export function resolveOfficerPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl?.trim()) return null;

  const trimmed = photoUrl.trim();

  if (trimmed.startsWith("/uploads/officers/")) {
    return trimmed;
  }

  try {
    const { hostname } = new URL(trimmed);
    if (PLACEHOLDER_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return null;
    }
  } catch {
    return null;
  }

  return trimmed;
}

export function isLocalOfficerUpload(photoUrl: string): boolean {
  return photoUrl.startsWith("/uploads/officers/");
}
