import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassAlertVariant = "error" | "success" | "info";

export type GlassAlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassAlertVariant;
};

const variantClasses: Record<GlassAlertVariant, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  info: "border-orange-500/30 bg-orange-500/10 text-orange-400",
};

export function GlassAlert({ variant = "error", className, ...props }: GlassAlertProps) {
  return (
    <div
      className={cn("rounded-xl border px-3 py-2 text-sm", variantClasses[variant], className)}
      role="alert"
      {...props}
    />
  );
}
