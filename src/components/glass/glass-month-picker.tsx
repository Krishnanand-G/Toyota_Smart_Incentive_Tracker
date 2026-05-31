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
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PANEL_WIDTH = 260;
const PANEL_HEIGHT = 280;

export type GlassMonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
};

export function GlassMonthPicker({ value, onChange, className, id }: GlassMonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const { year: selectedYear, month: selectedMonth } = parseMonthKey(value);
  const [viewYear, setViewYear] = useState(selectedYear);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, PANEL_WIDTH);
    let left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < PANEL_HEIGHT && rect.top > PANEL_HEIGHT;
    const top = openAbove ? rect.top - PANEL_HEIGHT - 8 : rect.bottom + 8;

    setCoords({ top: Math.max(8, top), left, width });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setViewYear(selectedYear);
  }, [open, selectedYear]);

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

  function selectMonth(month: number) {
    const monthKey = toMonthKey(viewYear, month);
    if (monthKey === value) {
      setOpen(false);
      return;
    }
    onChange(monthKey);
    setOpen(false);
  }

  const monthPanel =
    mounted && open && coords ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Choose month"
        style={{ top: coords.top, left: coords.left, width: coords.width }}
        className={cn(
          "fixed z-[200] rounded-lg border border-[var(--glass-border)] bg-[var(--glass-elevated)] p-3",
          "shadow-[var(--glass-shadow-elevated)]",
        )}
      >
          <div className="mb-3 flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setViewYear((y: number) => y - 1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-[var(--glass-soft)] hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-sm font-semibold text-foreground">{viewYear}</span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setViewYear((y: number) => y + 1)}
              className="inline-flex h-8 w-8 items-center justify-center text-muted transition hover:bg-[var(--glass-soft)] hover:text-foreground"
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
                      ? "bg-accent-primary font-semibold text-white"
                      : "text-foreground hover:bg-[var(--glass-soft)]",
                  )}
                >
                  {label}
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
                onChange(currentMonthKey());
                setOpen(false);
              }}
              className="text-xs font-medium text-accent-primary transition hover:opacity-80"
            >
              This month
            </button>
          </div>
        </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          if (!open) updateCoords();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "glass-input inline-flex w-auto items-center gap-2 rounded-md px-3 py-1.5 text-xs text-foreground transition",
          open && "border-accent-primary shadow-[0_0_0_3px_var(--focus-ring)]",
          className,
        )}
      >
        <span>{formatMonthDisplay(value)}</span>
        <Calendar size={14} className="shrink-0 text-muted" aria-hidden />
      </button>
      {monthPanel ? createPortal(monthPanel, document.body) : null}
    </>
  );
}
