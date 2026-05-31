"use client";

import { isLocalOfficerUpload, resolveOfficerPhotoUrl } from "@/lib/officer-photo";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type OfficerAvatarProps = {
  fullName: string | null;
  email: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const iconSizes = {
  sm: 20,
  md: 22,
  lg: 28,
};

export function OfficerAvatar({
  fullName,
  email,
  photoUrl,
  size = "sm",
  selected,
  className,
}: OfficerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedPhoto = resolveOfficerPhotoUrl(photoUrl);
  const showPhoto = Boolean(resolvedPhoto) && !imageFailed;
  const sizeClass = sizeClasses[size];

  if (showPhoto && resolvedPhoto) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md border border-border",
          sizeClass,
          className,
        )}
      >
        <Image
          src={resolvedPhoto}
          alt={fullName ?? email}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized={isLocalOfficerUpload(resolvedPhoto)}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border",
        sizeClass,
        selected
          ? "border-red-200 bg-red-50 text-accent-primary"
          : "border-border bg-surface-hover text-muted",
        className,
      )}
      aria-label={fullName ?? email}
    >
      <User size={iconSizes[size]} strokeWidth={1.75} />
    </div>
  );
}
