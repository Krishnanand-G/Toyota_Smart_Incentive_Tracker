"use client";

import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  currentDateKey,
  daysInMonth,
  firstWeekdayOfMonth,
  formatDateDisplay,
  isDateInRange,
  parseDateKey,
  toDateKey,
} from "@/lib/date-picker-utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type GlassDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  id?: string;
  required?: boolean;
};

export function GlassDatePicker({
  value,
  onChange,
  min,
  max,
  className,
  id,
  required,
}: GlassDatePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parseDateKey(value) : null;
  const [viewYear, setViewYear] = useState(parsed?.year ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? new Date().getMonth() + 1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !value) return;
    const { year, month } = parseDateKey(value);
    setViewYear(year);
    setViewMonth(month);
  }, [open, value]);

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

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(viewYear, viewMonth);
    const leadingBlanks = firstWeekdayOfMonth(viewYear, viewMonth);
    const cells: Array<{ day: number | null; dateKey: string | null }> = [];

    for (let i = 0; i < leadingBlanks; i += 1) {
      cells.push({ day: null, dateKey: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({ day, dateKey: toDateKey(viewYear, viewMonth, day) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  function shiftMonth(delta: number) {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
  }

  function selectDate(dateKey: string) {
    if (!isDateInRange(dateKey, min, max)) return;
    onChange(dateKey);
    setOpen(false);
  }

  const displayValue = value ? formatDateDisplay(value) : "Select date";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-required={required}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "glass-input flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm text-foreground transition",
          open && "border-[rgba(249,115,22,0.5)] shadow-[0_0_0_3px_var(--focus-ring)]",
          !value && "text-muted",
        )}
      >
        <span>{displayValue}</span>
        <Calendar size={16} className="shrink-0 text-muted" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-full z-50 mt-2 w-[280px] border border-white/10 bg-[var(--glass-elevated)] p-3 shadow-[var(--glass-shadow-elevated)]"
        >
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {MONTH_LABELS[viewMonth - 1]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1 text-center text-[10px] font-medium uppercase text-muted">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => {
              if (!cell.day || !cell.dateKey) {
                return <div key={`blank-${index}`} className="h-9" aria-hidden />;
              }

              const isSelected = cell.dateKey === value;
              const isDisabled = !isDateInRange(cell.dateKey, min, max);

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDate(cell.dateKey!)}
                  className={cn(
                    "h-9 text-sm transition",
                    isSelected
                      ? "bg-accent-blue font-semibold text-black"
                      : isDisabled
                        ? "cursor-not-allowed text-muted/40"
                        : "text-foreground hover:bg-white/5",
                  )}
                >
                  {cell.day}
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
                const today = currentDateKey();
                if (isDateInRange(today, min, max)) {
                  onChange(today);
                  setOpen(false);
                }
              }}
              className="text-xs font-medium text-accent-blue transition hover:opacity-80"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
