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
      <div className="mb-6 px-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Toyota Incentive</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{portalLabel}</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "glass-pill text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-white/40 hover:text-slate-900",
              )}
            >
              <NavIcon name={item.icon} className={active ? "text-blue-600" : "text-slate-500"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200/60 pt-4">
        <SignOutButton className="w-full justify-center" />
      </div>
    </aside>
  );
}
