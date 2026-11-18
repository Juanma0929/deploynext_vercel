import type { ReactNode } from "react";

import type { Tone } from "./badge";
import { cn } from "./cn";

const ALERT_TONES: Readonly<Record<Tone, string>> = {
  neutral: "border-slate-300 bg-slate-50 text-slate-900",
  info: "border-sky-300 bg-sky-50 text-sky-950",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  danger: "border-red-300 bg-red-50 text-red-900",
};

interface AlertProps {
  /** For a form that points at its error with aria-describedby. */
  readonly id?: string;
  readonly tone?: Tone;
  /**
   * "alert" interrupts the screen reader: for errors. "status" waits its turn:
   * for confirmations and progress. Defaults to "alert" for danger and
   * warning, "status" otherwise.
   */
  readonly role?: "alert" | "status";
  /** Shows "Cerrar" at the end. */
  readonly onDismiss?: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

/** What a screen that loads in the browser shows when the request failed: why, and a retry. */
export function RetryAlert({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) {
  return (
    <Alert tone="danger">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="self-start font-medium underline underline-offset-2 hover:no-underline"
      >
        Reintentar
      </button>
    </Alert>
  );
}

/** What a screen shows while its data loads in the browser. */
export function LoadingText({ children }: { readonly children: ReactNode }) {
  return (
    <p role="status" className="text-muted text-sm">
      {children}
    </p>
  );
}

/** A message that stays on screen: an error, a warning, a confirmation. */
export function Alert({ id, tone = "info", role, onDismiss, children, className }: AlertProps) {
  return (
    <div
      id={id}
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      className={cn("flex items-start gap-3 rounded-md border px-4 py-3 text-sm", ALERT_TONES[tone], className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      {onDismiss !== undefined && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
