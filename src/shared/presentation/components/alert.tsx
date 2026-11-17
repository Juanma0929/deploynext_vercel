import type { ReactNode } from "react";

import { cn } from "../cn";

export type AlertTone = "error" | "success" | "info";

interface AlertProps {
  readonly tone?: AlertTone;
  readonly children: ReactNode;
  readonly className?: string;
}

const TONES: Readonly<Record<AlertTone, string>> = {
  error: "border-danger/30 bg-danger/5 text-danger",
  success: "border-success/30 bg-success/5 text-success",
  info: "border-border bg-surface text-muted",
};

/**
 * How the application talks back to the user. The statement rules out
 * window.alert: a message belongs on the page, next to what caused it, and it
 * is announced to assistive technology without stealing the focus.
 */
export function Alert({ tone = "error", children, className }: AlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md border px-3 py-2 text-sm", TONES[tone], className)}
    >
      {children}
    </p>
  );
}
