// This file provides a utility function for merging and conditionally joining CSS class names,
// especially useful when working with Tailwind CSS. It leverages the "clsx" library to conditionally
// join class names and "tailwind-merge" to intelligently resolve conflicting Tailwind classes.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple CSS class values using clsx and resolves Tailwind CSS class conflicts
 * using tailwind-merge.
 *
 * @param inputs - An array of class values (strings, arrays, objects, etc.)
 * @returns A string with merged and deduplicated class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
