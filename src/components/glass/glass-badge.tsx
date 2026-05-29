import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassBadgeVariant = "default" | "blue" | "green" | "amber" | "red";

export type GlassBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: GlassBadgeVariant;
};

const variantClasses: Record<GlassBadgeVariant, string> = {
  default: "glass-pill text-muted",
  blue: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  red: "bg-red-500/15 text-red-400 border border-red-500/25",
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
