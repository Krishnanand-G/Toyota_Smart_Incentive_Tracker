"use client";

import {
  MONTH_LABELS,
  currentMonthKey,
  formatMonthDisplay,
  toMonthKey,
} from "@/lib/date-picker-utils";
import { parseMonthKey } from "@/lib/sale-entry-utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type GlassMonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
};

export function GlassMonthPicker({ value, onChange, className, id }: GlassMonthPickerProps) {
  const [open, setOpen] = useState(false);
  const { year: selectedYear, month: selectedMonth } = parseMonthKey(value);
  const [viewYear, setViewYear] = useState(selectedYear);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setViewYear(selectedYear);
  }, [open, selectedYear]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function selectMonth(month: number) {
    onChange(toMonthKey(viewYear, month));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "glass-input inline-flex w-auto items-center gap-2 px-3 py-1.5 text-xs text-foreground transition",
          open && "border-[rgba(249,115,22,0.5)] shadow-[0_0_0_3px_var(--focus-ring)]",
          className,
        )}
      >
        <span>{formatMonthDisplay(value)}</span>
        <Calendar size={14} className="shrink-0 text-muted" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose month"
          className="absolute right-0 top-full z-50 mt-2 w-[260px] border border-white/10 bg-[var(--glass-elevated)] p-3 shadow-[var(--glass-shadow-elevated)]"
        >
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setViewYear((y: number) => y - 1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-sm font-semibold text-foreground">{viewYear}</span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setViewYear((y: number) => y + 1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTH_LABELS.map((label, index) => {
              const month = index + 1;
              const isSelected = viewYear === selectedYear && month === selectedMonth;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectMonth(month)}
                  className={cn(
                    "px-2 py-2 text-sm transition",
                    isSelected
                      ? "bg-accent-blue font-semibold text-black"
                      : "text-foreground hover:bg-white/5",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted transition hover:text-foreground"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(currentMonthKey());
                setOpen(false);
              }}
              className="text-xs font-medium text-accent-blue transition hover:opacity-80"
            >
              This month
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
