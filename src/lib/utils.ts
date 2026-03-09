import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts a page size value to a valid array length for skeleton loaders.
 * Handles Number.MAX_SAFE_INTEGER (when "all" is selected) and clamps to reasonable limits.
 * 
 * @param pageSize - The page size value (can be Number.MAX_SAFE_INTEGER for "all")
 * @param defaultSize - Default size to use (default: 10)
 * @param maxSize - Maximum size to clamp to (default: 50)
 * @returns A safe array length value
 */
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
