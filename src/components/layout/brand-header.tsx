"use client";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Image from "next/image";

type BrandHeaderProps = {
  portalLabel: string;
  pageTitle?: string;
  onMenuClick?: () => void;
  showMobileSubtitle?: boolean;
  officerMobile?: boolean;
};

export function BrandHeader({
  portalLabel,
  pageTitle,
  onMenuClick,
  showMobileSubtitle = false,
  officerMobile = false,
}: BrandHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      {/* Mobile: single merged bar — menu | page title | sign out */}
      <div
        className={cn(
          "mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 lg:hidden",
          officerMobile ? "h-14" : "h-12",
        )}
      >
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(
            "flex items-center justify-center rounded-lg text-accent-primary transition hover:bg-surface-hover",
            officerMobile ? "min-h-[44px] min-w-[44px]" : "rounded-md p-2",
          )}
          aria-label="Open navigation menu"
        >
          <Menu size={officerMobile ? 22 : 20} />
        </button>
        <div className="min-w-0 flex-1 px-1 text-center">
          <h1 className="truncate text-sm font-semibold uppercase tracking-wide text-foreground">
            {pageTitle ?? portalLabel}
          </h1>
          {showMobileSubtitle ? (
            <p className="truncate text-[11px] text-muted">{portalLabel}</p>
          ) : null}
        </div>
        <SignOutButton compact />
      </div>

      {/* Desktop: brand + portal label */}
      <div className="mx-auto hidden h-14 max-w-[1400px] items-center justify-between px-6 lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/toyota-wordmark.svg"
            alt="Toyota"
            width={100}
            height={28}
            priority
            className="h-7 w-auto"
          />
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Incentive Tracker
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground">
            {portalLabel}
          </span>
          <SignOutButton compact className="inline-flex" />
        </div>
      </div>
    </header>
  );
}
