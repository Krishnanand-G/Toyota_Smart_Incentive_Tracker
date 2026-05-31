"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { cn } from "@/lib/utils";

export type OfficerHeaderProfile = {
  fullName: string | null;
  email: string;
  photoUrl: string | null;
  officerId: string | null;
};

export function officerDisplayName(fullName: string | null, email: string) {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : "there";
}

type OfficerHeaderIdentityProps = OfficerHeaderProfile & {
  compact?: boolean;
  className?: string;
};

export function OfficerHeaderIdentity({
  fullName,
  email,
  photoUrl,
  officerId,
  compact = false,
  className,
}: OfficerHeaderIdentityProps) {
  const name = officerDisplayName(fullName, email);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <OfficerAvatar
        fullName={fullName}
        email={email}
        photoUrl={photoUrl}
        size="sm"
        className={compact ? "!h-9 !w-9" : "!h-10 !w-10 lg:!h-11 lg:!w-11"}
      />
      <div className="min-w-0 text-left">
        <p
          className={cn(
            "truncate font-semibold leading-tight text-foreground",
            compact ? "text-sm" : "text-sm lg:text-base",
          )}
        >
          Hi, {name}
        </p>
        {officerId ? (
          <p className="truncate font-mono text-[10px] text-accent-primary lg:text-xs">{officerId}</p>
        ) : (
          <p className="truncate text-[10px] text-muted lg:text-xs">{email}</p>
        )}
      </div>
    </div>
  );
}
