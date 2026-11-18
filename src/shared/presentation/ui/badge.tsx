import type { ReactNode } from "react";

import { cn } from "./cn";

/**
 * The colors of the app, each with one meaning. A feature maps its own states
 * to them, so the same color always says the same thing: success is done,
 * warning is waiting, danger is a problem.
 */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const BADGE_TONES: Readonly<Record<Tone, string>> = {
  neutral: "bg-slate-200 text-slate-700",
  info: "bg-sky-100 text-sky-900",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
};

interface BadgeProps {
  readonly tone?: Tone;
  readonly children: ReactNode;
  readonly className?: string;
}

/** A short label of a state: "Pagada", "Inactivo", "Stock bajo". */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
