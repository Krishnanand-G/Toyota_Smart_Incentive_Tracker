"use client";

import { PageShell } from "@/components/layout/page-shell";
import type { NavItem } from "@/components/layout/nav-config";
import { titleFromPath } from "@/components/layout/nav-config";
import type { OfficerHeaderProfile } from "@/components/officer/officer-header-identity";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type MobileShellVariant = "default" | "officer";

type PortalLayoutProps = {
  portalLabel: string;
  navItems: NavItem[];
  children: ReactNode;
  mobileShell?: MobileShellVariant;
  officerProfile?: OfficerHeaderProfile | null;
};

export function PortalLayout({
  portalLabel,
  navItems,
  children,
  mobileShell = "default",
  officerProfile = null,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const pageTitle = titleFromPath(pathname, navItems);

  return (
    <PageShell
      portalLabel={portalLabel}
      pageTitle={pageTitle}
      navItems={navItems}
      mobileShell={mobileShell}
      officerProfile={officerProfile}
    >
      {children}
    </PageShell>
  );
}
