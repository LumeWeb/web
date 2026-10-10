import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class names, de-duplicating conflicting utilities via
 * tailwind-merge. Standard shadcn-style helper for class composition. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
