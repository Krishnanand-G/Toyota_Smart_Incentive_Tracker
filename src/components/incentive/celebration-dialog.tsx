"use client";

import { GlassButton, GlassCard } from "@/components/glass";
import { Trophy } from "lucide-react";
import { useEffect } from "react";

export type CelebrationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
};

export function CelebrationDialog({
  open,
  title,
  message,
  confirmLabel = "Continue",
  onClose,
}: CelebrationDialogProps) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard
        variant="elevated"
        className="relative z-10 w-full max-w-md space-y-4 border border-orange-500/30 p-6"
        role="dialog"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Trophy size={24} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{message}</p>
        <GlassButton type="button" variant="accent" onClick={onClose} className="w-full">
          {confirmLabel}
        </GlassButton>
      </GlassCard>
    </div>
  );
}
