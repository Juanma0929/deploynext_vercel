import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import { cn } from "./cn";

export type ButtonVariant =
  /** The main action of a screen: solid, in the primary color. */
  | "primary"
  /** A secondary action: white, with a border. */
  | "secondary"
  /** A destructive action, confirmed: solid red. */
  | "danger"
  /** The button that opens a destructive action: white, red border. */
  | "danger-outline"
  /** An action inside text: underlined, no box. */
  | "link";

export type ButtonSize = "sm" | "md";

const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-slate-300 bg-white hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  "danger-outline": "border border-red-300 bg-white text-red-700 hover:bg-red-50",
  link: "underline underline-offset-2 hover:no-underline",
};

const SIZES: Readonly<Record<ButtonSize, string>> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

/** The classes of a button, for the few elements that cannot be a Button (a <label>, say). */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
    "focus-visible:ring-primary/40 outline-none focus-visible:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    VARIANTS[variant],
    variant === "link" ? "p-0" : SIZES[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Disables the button and shows `loadingText` (or the children) while an action runs. */
  readonly isLoading?: boolean;
  readonly loadingText?: string;
}

/**
 * A button. It is type="button" unless told otherwise, so a button inside a
 * form never submits it by accident.
 */
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonClasses(variant, size), className)}
      {...rest}
    >
      {isLoading && loadingText !== undefined ? loadingText : children}
    </button>
  );
}

interface FilterChipProps {
  readonly label: string;
  /** How many items the filter leaves, shown as "(3)". */
  readonly count?: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

/** One option of a filter shown as pills: "Pagadas (3)". aria-pressed tells which is on. */
export function FilterChip({ label, count, isActive, onSelect }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "focus-visible:ring-primary/40 rounded-full border px-3 py-1 text-sm outline-none focus-visible:ring-2",
        isActive ? "border-primary bg-primary/10 text-primary font-medium" : "border-slate-300 bg-white hover:bg-slate-100",
      )}
    >
      {label}
      {count !== undefined && <span className="tabular-nums"> ({count})</span>}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
};

/** A link that looks like a button: for actions that are a navigation. */
export function ButtonLink({ variant = "primary", size = "md", className, ...rest }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, size), className)} {...rest} />;
}
