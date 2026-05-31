import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassBadgeVariant = "default" | "blue" | "green" | "amber" | "red";

export type GlassBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: GlassBadgeVariant;
};

const variantClasses: Record<GlassBadgeVariant, string> = {
  default: "bg-surface-hover text-muted border border-border",
  blue: "bg-red-50 text-accent-primary border border-red-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  amber: "bg-amber-50 text-amber-800 border border-amber-200",
  red: "bg-red-50 text-red-700 border border-red-200",
};

export function GlassBadge({ variant = "default", className, ...props }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
