"use client";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

type TopBarProps = {
  title: string;
  onMenuClick: () => void;
  className?: string;
};

export function TopBar({ title, onMenuClick, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "glass-base sticky top-4 z-20 flex items-center justify-between gap-4 rounded-glass px-4 py-3 lg:hidden",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="glass-pill rounded-lg p-2 text-muted hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
      </div>
      <SignOutButton compact />
    </header>
  );
}
