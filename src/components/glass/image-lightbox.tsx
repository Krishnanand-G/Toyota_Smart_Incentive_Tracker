"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

export type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string | null;
  className?: string;
};

export function ImageLightbox({
  open,
  onClose,
  src,
  alt,
  caption,
  className,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8", className)}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        aria-label="Close photo preview"
        className="fixed inset-0 bg-black/85"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 z-20 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:-top-10"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[min(85vh,900px)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        {caption ? (
          <p className="mt-4 max-w-full truncate text-center text-sm font-medium text-white/90">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
