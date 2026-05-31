import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type GlassSkeletonProps = HTMLAttributes<HTMLDivElement>;

export function GlassSkeleton({ className, ...props }: GlassSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-background-muted", className)}
      aria-hidden
      {...props}
    />
  );
}
