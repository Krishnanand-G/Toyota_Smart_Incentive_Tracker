"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { GlassCard } from "./glass-card";

export type GlassModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function GlassModal({ open, onClose, title, children, className }: GlassModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard variant="elevated" className={cn("relative z-10 w-full max-w-lg p-6", className)} role="dialog">
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="glass-pill rounded-full p-1.5 text-muted transition hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </GlassCard>
    </div>
  );
}
