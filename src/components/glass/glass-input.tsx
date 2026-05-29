import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export type GlassInputProps = InputHTMLAttributes<HTMLInputElement>;

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(function GlassInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "glass-input w-full rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
});
