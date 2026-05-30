export type NavIconName = "car" | "layers" | "users" | "dashboard" | "history" | "plus";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  match?: "exact" | "prefix";
};

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", match: "exact" },
  { href: "/admin/cars", label: "Cars", icon: "car", match: "prefix" },
  { href: "/admin/slabs", label: "Slabs", icon: "layers", match: "prefix" },
  { href: "/admin/officers", label: "Sales Officers", icon: "users", match: "prefix" },
];

export const officerNavItems: NavItem[] = [
  { href: "/officer", label: "Dashboard", icon: "dashboard", match: "exact" },
  { href: "/officer/log-sale", label: "Log sale", icon: "plus", match: "prefix" },
  { href: "/officer/history", label: "History", icon: "history", match: "prefix" },
];

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function titleFromPath(pathname: string, navItems: NavItem[]) {
  const matches = navItems.filter((item) => isNavItemActive(pathname, item));
  if (!matches.length) return "Overview";
  return matches.sort((a, b) => b.href.length - a.href.length)[0].label;
}
