import { cn } from "./cn";

const SIZES = { sm: "size-5 border-2", md: "size-8 border-4" } as const;

/** A spinning circle. Decorative: say what is loading next to it, for screen readers. */
export function Spinner({ size = "md", className }: { readonly size?: keyof typeof SIZES; readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-primary inline-block shrink-0 animate-spin rounded-full border-t-transparent",
        SIZES[size],
        className,
      )}
    />
  );
}
