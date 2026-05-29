"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import type { NavItem } from "@/components/layout/nav-config";
import { useEffect, useState, type ReactNode } from "react";

type PageShellProps = {
  portalLabel: string;
  pageTitle: string;
  pageSubtitle?: string;
  navItems: NavItem[];
  children: ReactNode;
};

function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-blob -left-24 top-0 h-72 w-72 bg-orange-500/5" />
      <div className="ambient-blob right-0 top-24 h-80 w-80 bg-white/[0.02]" />
    </div>
  );
}

export function PageShell({ portalLabel, pageTitle, pageSubtitle, navItems, children }: PageShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <AmbientBackground />

      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-4 p-4 lg:p-6">
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-6">
            <Sidebar portalLabel={portalLabel} navItems={navItems} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar
            title={pageTitle}
            subtitle={pageSubtitle}
            portalLabel={portalLabel}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="glass-base min-h-[calc(100vh-8rem)] flex-1 rounded-glass p-5 sm:p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8">
            <div className="mb-6 hidden items-start justify-between lg:flex">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">{portalLabel}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
                {pageSubtitle ? <p className="mt-1 text-sm text-muted">{pageSubtitle}</p> : null}
              </div>
              <div className="glass-pill rounded-full px-3 py-1.5 font-mono text-xs text-muted">
                {today}
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(85vw,20rem)] p-4">
            <Sidebar
              portalLabel={portalLabel}
              navItems={navItems}
              onNavigate={() => setMobileOpen(false)}
              className="h-full shadow-glass-elevated"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
