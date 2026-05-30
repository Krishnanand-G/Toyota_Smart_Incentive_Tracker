"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type OfficerAvatarProps = {
  fullName: string | null;
  email: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11 text-sm",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function OfficerAvatar({
  fullName,
  email,
  photoUrl,
  size = "sm",
  selected,
  className,
}: OfficerAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-white/10",
          sizeClass,
          className,
        )}
      >
        <Image src={photoUrl} alt={fullName ?? email} fill className="object-cover" sizes="64px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-bold",
        sizeClass,
        selected ? "bg-orange-500/20 text-orange-300" : "bg-white/5 text-foreground",
        className,
      )}
    >
      {initials(fullName, email)}
    </div>
  );
}
