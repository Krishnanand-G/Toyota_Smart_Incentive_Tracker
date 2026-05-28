import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassBadgeVariant = "default" | "blue" | "green" | "amber" | "red";

export type GlassBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: GlassBadgeVariant;
};

const variantClasses: Record<GlassBadgeVariant, string> = {
  default: "glass-pill text-slate-700",
  blue: "bg-blue-500/15 text-blue-700 border border-blue-200/60",
  green: "bg-emerald-500/15 text-emerald-700 border border-emerald-200/60",
  amber: "bg-amber-500/15 text-amber-800 border border-amber-200/60",
  red: "bg-red-500/15 text-red-700 border border-red-200/60",
};

export function GlassBadge({ variant = "default", className, ...props }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
