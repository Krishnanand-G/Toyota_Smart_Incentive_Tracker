"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";

type OfficerWelcomeBannerProps = {
  fullName: string | null;
  email: string;
  photoUrl: string | null;
  officerId?: string | null;
};

function displayName(fullName: string | null, email: string) {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : "there";
}

export function OfficerWelcomeBanner({
  fullName,
  email,
  photoUrl,
  officerId,
}: OfficerWelcomeBannerProps) {
  const name = displayName(fullName, email);

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-gradient-to-r from-red-50/80 to-background px-3 py-3 sm:mb-5 sm:gap-4 sm:px-4 sm:py-3.5 lg:mb-6">
      <OfficerAvatar
        fullName={fullName}
        email={email}
        photoUrl={photoUrl}
        size="lg"
        className="!h-14 !w-14 sm:!h-16 sm:!w-16"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Your portal</p>
        <h2 className="truncate text-lg font-semibold leading-tight text-foreground sm:text-xl">
          Hi, {name}
        </h2>
        {officerId ? (
          <p className="mt-0.5 truncate font-mono text-xs text-accent-primary">{officerId}</p>
        ) : (
          <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
        )}
      </div>
    </div>
  );
}
