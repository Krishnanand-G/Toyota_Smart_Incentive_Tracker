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
        "glass-input w-full rounded-xl px-3 py-2.5 text-slate-900 placeholder:text-slate-400",
        "focus:border-accent-blue/50 focus:outline-none focus:ring-2 focus:ring-accent-blue/40",
        className,
      )}
      {...props}
    />
  );
});
