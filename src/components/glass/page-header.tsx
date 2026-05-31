import { GlassBadge } from "./glass-badge";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  badge?: string;
  badgeVariant?: "default" | "blue" | "green" | "amber" | "red";
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  badge,
  badgeVariant = "blue",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-2 flex flex-col gap-2 pb-1 lg:mb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:pb-2">
      <div className="min-w-0 flex-1 space-y-1.5 lg:space-y-2">
        {badge ? <GlassBadge variant={badgeVariant}>{badge}</GlassBadge> : null}
        {title ? (
          <h1 className="text-lg font-semibold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="text-sm text-muted max-lg:line-clamp-2 lg:block">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
