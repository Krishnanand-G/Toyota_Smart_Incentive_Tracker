import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Click the same item again to clear a single-select value. */
export function toggleSelection<T>(current: T | null, next: T): T | null {
  return current === next ? null : next;
}
