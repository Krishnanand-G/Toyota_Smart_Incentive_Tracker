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
      <div className="ambient-blob -left-24 top-0 h-72 w-72 bg-violet-300/30" />
      <div className="ambient-blob right-0 top-24 h-80 w-80 bg-sky-200/35" />
      <div className="ambient-blob bottom-0 left-1/3 h-64 w-64 bg-emerald-200/30" />
    </div>
  );
}

export function PageShell({ portalLabel, pageTitle, pageSubtitle, navItems, children }: PageShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 p-4 lg:p-6">
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-6">
            <Sidebar portalLabel={portalLabel} navItems={navItems} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar
            title={pageTitle}
            subtitle={pageSubtitle}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="glass-base min-h-[calc(100vh-8rem)] flex-1 rounded-glass p-5 sm:p-6 lg:min-h-[calc(100vh-3rem)]">
            <div className="mb-6 hidden lg:block">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
              {pageSubtitle ? <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p> : null}
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
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
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
