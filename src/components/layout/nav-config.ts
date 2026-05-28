import { Car, History, LayoutDashboard, Layers, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

export const adminNavItems: NavItem[] = [
  { href: "/admin/cars", label: "Cars", icon: Car, match: "prefix" },
  { href: "/admin/slabs", label: "Slabs", icon: Layers, match: "prefix" },
  { href: "/admin/officers", label: "Officers", icon: Users, match: "prefix" },
];

export const officerNavItems: NavItem[] = [
  { href: "/officer", label: "Dashboard", icon: LayoutDashboard, match: "exact" },
  { href: "/officer/history", label: "History", icon: History, match: "prefix" },
];

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
