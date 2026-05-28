"use client";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

type TopBarProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  className?: string;
};

export function TopBar({ title, subtitle, onMenuClick, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "glass-base flex items-center justify-between gap-4 rounded-glass px-4 py-3 lg:hidden",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="glass-pill rounded-full p-2 text-slate-700"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <SignOutButton compact />
    </header>
  );
}
