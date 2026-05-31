import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassAlertVariant = "error" | "success" | "info";

export type GlassAlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassAlertVariant;
};

const variantClasses: Record<GlassAlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-red-200 bg-red-50 text-accent-primary",
};

export function GlassAlert({ variant = "error", className, ...props }: GlassAlertProps) {
  return (
    <div
      className={cn("rounded-md border px-3 py-2 text-sm", variantClasses[variant], className)}
      role="alert"
      {...props}
    />
  );
}
