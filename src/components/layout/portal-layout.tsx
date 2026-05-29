"use client";

import { PageShell } from "@/components/layout/page-shell";
import type { NavItem } from "@/components/layout/nav-config";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PortalLayoutProps = {
  portalLabel: string;
  navItems: NavItem[];
  children: ReactNode;
};

function titleFromPath(pathname: string, navItems: NavItem[]) {
  const match = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Overview";
}

export function PortalLayout({ portalLabel, navItems, children }: PortalLayoutProps) {
  const pathname = usePathname();
  const pageTitle = titleFromPath(pathname, navItems);
  const subtitle =
    portalLabel === "Admin Portal"
      ? "Configure inventory, slabs, and officer performance."
      : "Track sales monthly and monitor incentive payout.";

  return (
    <PageShell
      portalLabel={portalLabel}
      pageTitle={pageTitle}
      pageSubtitle={subtitle}
      navItems={navItems}
    >
      {children}
    </PageShell>
  );
}
