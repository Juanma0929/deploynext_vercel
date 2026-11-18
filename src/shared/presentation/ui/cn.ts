/** Joins class names, skipping the empty ones: cn("a", isOn && "b", undefined) is "a b". */
export function cn(...classes: ReadonlyArray<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
