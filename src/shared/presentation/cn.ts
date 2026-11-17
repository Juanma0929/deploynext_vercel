/**
 * Joins class names and drops what is not there, so a component can write
 * `cn("base", isActive && "active", className)` without building strings with
 * leftover spaces or the word "false" in them.
 */
export function cn(...values: ReadonlyArray<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === "string").join(" ");
}
