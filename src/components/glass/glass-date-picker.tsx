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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CALENDAR_WIDTH = 280;
const CALENDAR_HEIGHT = 380;

type PopoverCoords = {
  top: number;
  left: number;
  width: number;
};

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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const parsed = value ? parseDateKey(value) : null;
  const [viewYear, setViewYear] = useState(parsed?.year ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? new Date().getMonth() + 1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, CALENDAR_WIDTH);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < CALENDAR_HEIGHT && rect.top > CALENDAR_HEIGHT;
    const top = openAbove ? rect.top - CALENDAR_HEIGHT - 8 : rect.bottom + 8;

    setCoords({ top: Math.max(8, top), left, width });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !value) return;
    const { year, month } = parseDateKey(value);
    setViewYear(year);
    setViewMonth(month);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    updateCoords();

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onReposition() {
      updateCoords();
    }

    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updateCoords]);

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
    onChange(value === dateKey && !required ? "" : dateKey);
    setOpen(false);
  }

  function toggleOpen() {
    if (!open) updateCoords();
    setOpen((prev) => !prev);
  }

  const displayValue = value
    ? formatDateDisplay(value)
    : required
      ? "Select date *"
      : "Select date";

  const calendarPanel =
    mounted && open && coords ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Choose date"
        style={{ top: coords.top, left: coords.left, width: coords.width }}
        className={cn(
          "fixed z-[200] rounded-lg border border-[var(--glass-border)] bg-[var(--glass-elevated)] p-3",
          "shadow-[var(--glass-shadow-elevated)]",
        )}
      >
        <div className="mb-3 flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-[var(--glass-soft)] hover:text-foreground"
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
            className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-[var(--glass-soft)] hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1 text-center text-xs font-medium uppercase text-muted">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, index) => {
            if (!cell.day || !cell.dateKey) {
              return <div key={`blank-${index}`} className="h-9 max-lg:h-10" aria-hidden />;
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
                  "h-9 text-sm transition max-lg:h-10 max-lg:w-10",
                  isSelected
                    ? "bg-accent-primary font-semibold text-white"
                    : isDisabled
                      ? "cursor-not-allowed text-muted/40"
                      : "text-foreground hover:bg-[var(--glass-soft)]",
                )}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--glass-border)] pt-2">
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
            className="text-xs font-medium text-accent-primary transition hover:opacity-80"
          >
            Today
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className={className}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={toggleOpen}
          className={cn(
            "glass-input flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition",
            open && "border-accent-primary shadow-[0_0_0_3px_var(--focus-ring)]",
            !value && "text-muted",
          )}
        >
          <span>{displayValue}</span>
          <Calendar size={16} className="shrink-0 text-muted" aria-hidden />
        </button>
      </div>
      {calendarPanel ? createPortal(calendarPanel, document.body) : null}
    </>
  );
}
