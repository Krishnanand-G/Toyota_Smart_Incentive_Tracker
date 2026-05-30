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

export function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatMonthDisplay(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_LABELS[month - 1]}, ${year}`;
}

export function formatDateDisplay(dateKey: string) {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  return `${MONTH_LABELS[month - 1]} ${day}, ${year}`;
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
  return toMonthKey(date.getFullYear(), date.getMonth() + 1);
}

export function currentDateKey() {
  const date = new Date();
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
