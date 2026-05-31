import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type GlassButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";

export type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: GlassButtonVariant;
};

const variantClasses: Record<GlassButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-60",
  secondary:
    "border border-border bg-background text-foreground hover:bg-surface-hover disabled:opacity-60",
  ghost:
    "bg-transparent text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-60",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60",
  accent:
    "bg-accent-primary text-white font-semibold hover:bg-[var(--accent-primary-hover)] disabled:opacity-60",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(function GlassButton(
  { variant = "secondary", className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-medium uppercase tracking-wide transition focus:outline-none focus-visible:outline-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
