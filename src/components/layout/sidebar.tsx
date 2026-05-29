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
};

export function Sidebar({ portalLabel, navItems, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("glass-elevated flex h-full flex-col rounded-glass p-4", className)}>
      <div className="mb-6 border-b border-white/10 px-1 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Toyota Incentive</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">{portalLabel}</h2>
        <p className="mt-1 text-xs text-muted">Performance & payout ops</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-foreground"
                  : "text-muted hover:bg-white/5 hover:text-foreground",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-orange-500" />
              ) : null}
              <NavIcon
                name={item.icon}
                className={cn(
                  "ml-1",
                  active ? "text-orange-400" : "text-muted group-hover:text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <SignOutButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
