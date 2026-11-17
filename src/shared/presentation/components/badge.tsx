import type { ReactNode } from "react";

import { cn } from "../cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}

const TONES: Readonly<Record<BadgeTone, string>> = {
  neutral: "border-border text-muted",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
  danger: "border-danger/30 bg-danger/5 text-danger",
  info: "border-primary/30 bg-primary/5 text-primary",
};

/** A short state: the role of a user, low stock, the state of a sale. */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
