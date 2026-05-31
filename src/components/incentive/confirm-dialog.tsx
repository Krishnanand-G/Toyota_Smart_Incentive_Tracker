"use client";

import { GlassButton, GlassCard } from "@/components/glass";
import { useEffect } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <GlassCard variant="elevated" className="relative z-10 w-full max-w-md space-y-4 p-6" role="alertdialog">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{message}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <GlassButton type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </GlassButton>
          <GlassButton
            type="button"
            variant={variant === "danger" ? "danger" : "accent"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}
