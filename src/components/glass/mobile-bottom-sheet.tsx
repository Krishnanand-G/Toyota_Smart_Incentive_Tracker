"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapHeight?: string;
  className?: string;
};

export function MobileBottomSheet({
  open,
  onClose,
  title,
  children,
  snapHeight = "92vh",
  className,
}: MobileBottomSheetProps) {
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
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl border border-border bg-background shadow-glass-elevated",
          className,
        )}
        style={{ maxHeight: snapHeight }}
      >
        <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-3 pt-2">
          <div className="mb-2 h-1 w-10 rounded-full bg-border" aria-hidden />
          <div className="flex w-full items-center justify-between gap-3">
            {title ? (
              <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                {title}
              </h2>
            ) : (
              <span className="flex-1" />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
