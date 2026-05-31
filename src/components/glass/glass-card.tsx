import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type GlassCardVariant = "base" | "elevated" | "pill";

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassCardVariant;
};

const variantClasses: Record<GlassCardVariant, string> = {
  base: "glass-base rounded-lg",
  elevated: "glass-elevated rounded-lg",
  pill: "glass-pill rounded-full",
};

export function GlassCard({ variant = "base", className, ...props }: GlassCardProps) {
  return <div className={cn(variantClasses[variant], className)} {...props} />;
}
