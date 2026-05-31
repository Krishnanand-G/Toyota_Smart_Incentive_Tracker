"use client";

import { GlassButton, GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 lg:items-center lg:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <GlassCard
        variant="elevated"
        className={cn(
          "relative z-10 w-full space-y-4 border-red-200 p-6",
          "max-lg:rounded-b-none max-lg:rounded-t-xl max-lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "lg:max-w-md",
        )}
        role="dialog"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-accent-primary">
          <Trophy size={24} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">{message}</p>
        <GlassButton
          type="button"
          variant="accent"
          onClick={onClose}
          className="officer-touch w-full !min-h-[48px]"
        >
          {confirmLabel}
        </GlassButton>
      </GlassCard>
    </div>
  );
}
