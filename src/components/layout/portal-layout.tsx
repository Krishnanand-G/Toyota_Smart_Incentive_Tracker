"use client";

import { PageShell } from "@/components/layout/page-shell";
import type { NavItem } from "@/components/layout/nav-config";
import { titleFromPath } from "@/components/layout/nav-config";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PortalLayoutProps = {
  portalLabel: string;
  navItems: NavItem[];
  children: ReactNode;
};

export function PortalLayout({ portalLabel, navItems, children }: PortalLayoutProps) {
  const pathname = usePathname();
  const pageTitle = titleFromPath(pathname, navItems);

  return (
    <PageShell portalLabel={portalLabel} pageTitle={pageTitle} navItems={navItems}>
      {children}
    </PageShell>
  );
}
