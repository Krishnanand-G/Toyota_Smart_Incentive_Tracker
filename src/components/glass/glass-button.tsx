import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type GlassButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";

export type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: GlassButtonVariant;
};

const variantClasses: Record<GlassButtonVariant, string> = {
  primary:
    "bg-white text-black hover:bg-zinc-200 disabled:opacity-60",
  secondary:
    "border border-white/20 bg-transparent text-foreground hover:bg-white/5 disabled:opacity-60",
  ghost:
    "bg-transparent text-muted hover:bg-white/5 hover:text-foreground disabled:opacity-60",
  danger:
    "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 disabled:opacity-60",
  accent:
    "bg-accent-blue text-black font-semibold hover:opacity-90 disabled:opacity-60",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(function GlassButton(
  { variant = "secondary", className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:outline-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
