"use client";

import type { NavIconName } from "@/components/layout/nav-config";
import { Car, History, Layers, LayoutDashboard, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navIconMap: Record<NavIconName, LucideIcon> = {
  car: Car,
  layers: Layers,
  users: Users,
  dashboard: LayoutDashboard,
  history: History,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = navIconMap[name];
  return <Icon size={18} className={className} />;
}
