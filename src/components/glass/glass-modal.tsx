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
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden p-0 lg:items-center lg:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <GlassCard
        variant="elevated"
        className={cn(
          "relative z-10 grid w-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-t-xl rounded-b-none p-4 max-h-[90vh] lg:max-h-[calc(100vh-2rem)] lg:max-w-lg lg:rounded-lg lg:p-6",
          className,
        )}
        role="dialog"
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto lg:max-h-[min(85vh,640px)]">{children}</div>
      </GlassCard>
    </div>
  );
}
