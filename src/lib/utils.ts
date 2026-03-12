import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeSkeletonCount(
  pageSize: number | undefined,
  defaultSize: number = 10,
  maxSize: number = 50
): number {
  if (!pageSize || pageSize === Number.MAX_SAFE_INTEGER) {
    return defaultSize;
  }
  return Math.min(Math.max(1, pageSize), maxSize);
}
