"use client";

import { BrandHeader } from "@/components/layout/brand-header";
import type { MobileShellVariant } from "@/components/layout/portal-layout";
import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

type PageShellProps = {
  portalLabel: string;
  pageTitle: string;
  navItems: NavItem[];
  children: ReactNode;
  mobileShell?: MobileShellVariant;
};

export function PageShell({
  portalLabel,
  pageTitle,
  navItems,
  children,
  mobileShell = "default",
}: PageShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOfficerMobile = mobileShell === "officer";

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="relative min-h-screen bg-background-muted">
      <BrandHeader
        portalLabel={portalLabel}
        pageTitle={pageTitle}
        onMenuClick={() => setMobileOpen(true)}
        showMobileSubtitle={isOfficerMobile}
        officerMobile={isOfficerMobile}
      />

      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px]",
          isOfficerMobile
            ? "min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-3.5rem)]"
            : "min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-3.5rem)]",
        )}
      >
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <Sidebar portalLabel={portalLabel} navItems={navItems} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            className={cn(
              "flex-1 pb-safe sm:p-6 lg:p-8",
              isOfficerMobile ? "p-3" : "p-2",
            )}
          >
            <div
              className={cn(
                "glass-base min-h-full rounded-lg sm:p-6 lg:p-8",
                isOfficerMobile ? "p-4" : "p-3",
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className={cn(
              "absolute inset-0 transition-opacity",
              isOfficerMobile ? "bg-black/50" : "bg-black/40",
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-[min(85vw,20rem)] bg-background shadow-glass-elevated transition-transform duration-200 ease-out",
              isOfficerMobile && "rounded-r-2xl pt-[env(safe-area-inset-top)]",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <Sidebar
              portalLabel={portalLabel}
              navItems={navItems}
              onNavigate={() => setMobileOpen(false)}
              className="h-full border-r-0"
              drawerMode
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
