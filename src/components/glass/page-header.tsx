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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        {badge ? (
          <div className="flex flex-wrap items-center gap-2">
            <GlassBadge variant={badgeVariant}>{badge}</GlassBadge>
            {description ? <p className="text-sm text-muted">{description}</p> : null}
          </div>
        ) : null}
        {title ? <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1> : null}
        {!badge && description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
