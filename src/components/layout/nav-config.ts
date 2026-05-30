export type NavIconName = "car" | "layers" | "users" | "dashboard" | "history";

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
  { href: "/officer/history", label: "History", icon: "history", match: "prefix" },
];

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
