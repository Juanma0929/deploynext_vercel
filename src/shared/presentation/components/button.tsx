import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Disables the button and shows that something is in flight. */
  readonly isLoading?: boolean;
  readonly children: ReactNode;
}

const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border bg-surface hover:bg-background",
  danger: "bg-danger text-primary-foreground hover:opacity-90",
  ghost: "text-muted hover:text-foreground hover:bg-background",
};

const SIZES: Readonly<Record<ButtonSize, string>> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-sm",
};

/**
 * The button of the whole application. Every screen uses this one, which is why
 * the colours, the rounding and the disabled state look the same everywhere.
 */
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      // A button inside a form defaults to submit, which is rarely what a row
      // action wants: the type is explicit here and overridable.
      type={type}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-opacity",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
