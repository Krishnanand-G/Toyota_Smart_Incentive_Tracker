"use client";

import { ImageLightbox } from "@/components/glass/image-lightbox";
import { isLocalOfficerUpload, isSupabaseOfficerUpload, resolveOfficerPhotoUrl } from "@/lib/officer-photo";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useState } from "react";

type OfficerAvatarProps = {
  fullName: string | null;
  email: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
  /** Tap/click photo to open full-size preview. Default true. */
  previewable?: boolean;
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
  previewable = true,
}: OfficerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const resolvedPhoto = resolveOfficerPhotoUrl(photoUrl);
  const showPhoto = Boolean(resolvedPhoto) && !imageFailed;
  const sizeClass = sizeClasses[size];
  const label = fullName ?? email;

  function openPreview(event: MouseEvent) {
    event.stopPropagation();
    setPreviewOpen(true);
  }

  if (showPhoto && resolvedPhoto) {
    const image = (
      <Image
        src={resolvedPhoto}
        alt={label}
        fill
        className="object-cover"
        sizes="256px"
        unoptimized={isLocalOfficerUpload(resolvedPhoto) || isSupabaseOfficerUpload(resolvedPhoto)}
        onError={() => setImageFailed(true)}
      />
    );

    const frameClass = cn(
      "relative shrink-0 overflow-hidden rounded-md border border-border",
      sizeClass,
      previewable && "cursor-zoom-in transition hover:ring-2 hover:ring-accent-primary/30",
      className,
    );

    return (
      <>
        {previewable ? (
          <button
            type="button"
            onClick={openPreview}
            className={frameClass}
            aria-label={`View full photo of ${label}`}
          >
            {image}
          </button>
        ) : (
          <div className={frameClass}>{image}</div>
        )}
        {previewable ? (
          <ImageLightbox
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            src={resolvedPhoto}
            alt={label}
            caption={fullName}
          />
        ) : null}
      </>
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
      aria-label={label}
    >
      <User size={iconSizes[size]} strokeWidth={1.75} />
    </div>
  );
}
