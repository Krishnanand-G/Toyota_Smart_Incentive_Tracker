"use client";

import { isNavItemActive, type NavItem } from "@/components/layout/nav-config";
import { NavIcon } from "@/components/layout/nav-icons";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  portalLabel: string;
  navItems: NavItem[];
  onNavigate?: () => void;
  className?: string;
  drawerMode?: boolean;
};

export function Sidebar({
  portalLabel,
  navItems,
  onNavigate,
  className,
  drawerMode = false,
}: SidebarProps) {
  const pathname = usePathname();
  const inDrawer = drawerMode || Boolean(onNavigate);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-background px-4 py-6",
        inDrawer && "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="mb-6 border-b border-border px-1 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Toyota Incentive</p>
        <h2 className="mt-1 text-base font-semibold text-foreground">{portalLabel}</h2>
        <p className="mt-1 text-xs text-muted">Performance &amp; payout ops</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 font-medium uppercase tracking-wide transition",
                inDrawer ? "py-3.5 text-sm" : "py-2.5 text-xs",
                active
                  ? inDrawer
                    ? "bg-surface-hover text-foreground ring-1 ring-border"
                    : "bg-surface-hover text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {!inDrawer && active ? (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent-primary" />
              ) : null}
              <NavIcon
                name={item.icon}
                size={inDrawer ? 20 : 18}
                className={cn(
                  inDrawer ? "" : "ml-1",
                  active ? "text-accent-primary" : "text-muted group-hover:text-accent-primary",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-4 lg:hidden">
        <SignOutButton
          className={cn(
            "w-full justify-center",
            inDrawer && "officer-touch !min-h-[44px]",
          )}
        />
      </div>
    </aside>
  );
}
