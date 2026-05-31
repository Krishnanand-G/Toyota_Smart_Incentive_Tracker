"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { GlassBadge, GlassCard } from "@/components/glass";
import { formatMonthDisplay } from "@/lib/date-picker-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp } from "lucide-react";

import type { OfficerSummary } from "@/lib/admin-types";

type OfficerListItemProps = {
  officer: OfficerSummary;
  selected: boolean;
  totalMonthSales: number;
  onSelect: (id: string) => void;
};

export function OfficerListItem({ officer, selected, totalMonthSales, onSelect }: OfficerListItemProps) {
  const name = officer.fullName || "Unnamed sales officer";
  const progress = totalMonthSales > 0 ? (officer.thisMonthSales / totalMonthSales) * 100 : 0;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.005 }}
      onClick={() => onSelect(officer.id)}
      className="w-full text-left"
    >
      <GlassCard
        className={cn(
          "border p-3 transition lg:p-4",
          selected
            ? "border-red-200 bg-red-50 ring-1 ring-red-200"
            : "border-border hover:border-accent-primary",
        )}
      >
        <div className="flex items-center gap-2.5 lg:items-start lg:gap-3">
          <OfficerAvatar
            fullName={officer.fullName}
            email={officer.email}
            photoUrl={officer.photoUrl}
            size="sm"
            selected={selected}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground lg:text-base">{name}</p>
                {officer.officerId ? (
                  <p className="font-mono text-[10px] text-accent-primary lg:text-xs">{officer.officerId}</p>
                ) : null}
                <p className="truncate text-[11px] text-muted lg:text-xs">{officer.email}</p>
              </div>
              <ChevronRight
                size={16}
                className={cn("shrink-0 text-muted", selected && "text-accent-primary")}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-3 lg:gap-2">
              <GlassBadge variant={officer.totalSales > 0 ? "blue" : "default"}>
                {officer.totalSales} total
              </GlassBadge>
              {officer.thisMonthSales > 0 ? (
                <GlassBadge variant="green">{officer.thisMonthSales} this mo.</GlassBadge>
              ) : null}
            </div>

            <div className="mt-2 space-y-1 lg:mt-3 lg:space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted lg:text-xs">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} />
                  {officer.activeMonths} mo.
                </span>
                <span className="truncate">
                  {officer.latestMonth ? formatMonthDisplay(officer.latestMonth) : "No activity"}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-background-muted lg:h-1.5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    selected ? "bg-accent-primary" : "bg-border",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.button>
  );
}
