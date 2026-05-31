import { parseMonthKey } from "@/lib/sale-entry-utils";

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** MM/YYYY for month pickers and headers */
export function formatMonthDisplay(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return `${pad2(month)}/${year}`;
}

/** e.g. May 2026 — readable month headers on mobile */
export function formatMonthDisplayLong(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

/** DD/MM/YYYY from an internal YYYY-MM-DD date key */
export function formatDateDisplay(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey);
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

/** DD/MM/YYYY from ISO timestamps (UTC, stable for SSR) */
export function formatUtcDate(iso: string | Date, options: { style?: "short" | "long" } = {}) {
  const { style = "short" } = options;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const day = pad2(d.getUTCDate());
  const month = pad2(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  const weekday = WEEKDAY_NAMES[d.getUTCDay()];
  const formatted = `${day}/${month}/${year}`;

  if (style === "long") {
    return `${weekday}, ${formatted}`;
  }
  return formatted;
}

/** DD/MM for chart axis labels from YYYY-MM-DD */
export function formatChartDayLabel(dateKey: string) {
  const parts = dateKey.split("-");
  if (parts.length < 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

export function parseDateKey(dateKey: string) {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  return {
    year: Number(yearStr),
    month: Number(monthStr),
    day: Number(dayStr),
  };
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function firstWeekdayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function compareDateKeys(a: string, b: string) {
  return a.localeCompare(b);
}

export function isDateInRange(dateKey: string, min?: string, max?: string) {
  if (min && compareDateKeys(dateKey, min) < 0) return false;
  if (max && compareDateKeys(dateKey, max) > 0) return false;
  return true;
}

export function currentMonthKey() {
  const date = new Date();
  return toMonthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function currentDateKey() {
  const date = new Date();
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}
