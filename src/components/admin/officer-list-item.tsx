"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { GlassBadge, GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight, Mail, TrendingUp } from "lucide-react";

export type OfficerSummary = {
  id: string;
  email: string;
  fullName: string | null;
  officerId: string | null;
  photoUrl: string | null;
  totalSales: number;
  thisMonthSales: number;
  activeMonths: number;
  latestMonth: string | null;
};

type OfficerListItemProps = {
  officer: OfficerSummary;
  selected: boolean;
  maxSales: number;
  onSelect: (id: string) => void;
};

function formatMonth(monthKey: string | null) {
  if (!monthKey) return "No activity";
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function OfficerListItem({ officer, selected, maxSales, onSelect }: OfficerListItemProps) {
  const name = officer.fullName || "Unnamed sales officer";
  const progress = maxSales > 0 ? (officer.totalSales / maxSales) * 100 : 0;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.005 }}
      onClick={() => onSelect(officer.id)}
      className="w-full text-left"
    >
      <GlassCard
        className={cn(
          "border p-4 transition",
          selected
            ? "border-orange-500/50 bg-orange-500/[0.06] ring-1 ring-orange-500/30"
            : "border-white/10 hover:border-white/20",
        )}
      >
        <div className="flex items-start gap-3">
          <OfficerAvatar
            fullName={officer.fullName}
            email={officer.email}
            photoUrl={officer.photoUrl}
            selected={selected}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{name}</p>
                {officer.officerId ? (
                  <p className="mt-0.5 font-mono text-xs text-orange-400/90">{officer.officerId}</p>
                ) : null}
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                  <Mail size={12} className="shrink-0" />
                  {officer.email}
                </p>
              </div>
              <ChevronRight
                size={16}
                className={cn("mt-1 shrink-0 text-muted", selected && "text-orange-400")}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <GlassBadge variant={officer.totalSales > 0 ? "blue" : "default"}>
                {officer.totalSales} total sales
              </GlassBadge>
              {officer.thisMonthSales > 0 ? (
                <GlassBadge variant="green">{officer.thisMonthSales} this month</GlassBadge>
              ) : null}
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  {officer.activeMonths} active month{officer.activeMonths === 1 ? "" : "s"}
                </span>
                <span>Latest: {formatMonth(officer.latestMonth)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    selected ? "bg-orange-500" : "bg-white/20",
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
