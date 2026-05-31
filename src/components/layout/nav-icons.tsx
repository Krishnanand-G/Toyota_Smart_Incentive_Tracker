"use client";

import type { NavIconName } from "@/components/layout/nav-config";
import { Car, History, Layers, LayoutDashboard, PlusCircle, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navIconMap: Record<NavIconName, LucideIcon> = {
  car: Car,
  layers: Layers,
  users: Users,
  dashboard: LayoutDashboard,
  history: History,
  plus: PlusCircle,
};

export function NavIcon({
  name,
  className,
  size = 18,
}: {
  name: NavIconName;
  className?: string;
  size?: number;
}) {
  const Icon = navIconMap[name];
  return <Icon size={size} className={className} />;
}
