export function monthKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split("-");
  return { year: Number(yearStr), month: Number(monthStr) };
}

export function monthBoundsUtc(monthKey: string): { start: Date; end: Date } {
  const { year, month } = parseMonthKey(monthKey);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

export function soldAtFromDateInput(dateInput: string): Date {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function formatDateInput(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type ChartPoint = { date: string; cumulativeUnits: number };

export function buildChartSeries(
  soldDates: Date[],
  monthKey: string,
): ChartPoint[] {
  const { year, month } = parseMonthKey(monthKey);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const countsByDay = new Map<number, number>();
  for (const soldAt of soldDates) {
    const day = soldAt.getUTCDate();
    countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
  }

  const series: ChartPoint[] = [];
  let cumulative = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    cumulative += countsByDay.get(day) ?? 0;
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    series.push({ date, cumulativeUnits: cumulative });
  }
  return series;
}
