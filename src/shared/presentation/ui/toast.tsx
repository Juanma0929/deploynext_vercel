"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Tone } from "./badge";
import { cn } from "./cn";

export interface ToastInput {
  readonly message: string;
  readonly tone?: Tone;
}

interface ToastItem extends Required<ToastInput> {
  readonly id: number;
}

interface ToastContextValue {
  /** Shows a short message in the corner; it goes away on its own. */
  readonly toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** How long a toast stays, unless closed before. Errors stay longer: they need reading. */
const DURATION_MS: Readonly<Record<Tone, number>> = {
  neutral: 4_000,
  info: 4_000,
  success: 4_000,
  warning: 7_000,
  danger: 7_000,
};

const TOAST_TONES: Readonly<Record<Tone, string>> = {
  neutral: "border-slate-300 bg-white text-slate-900",
  info: "border-sky-300 bg-sky-50 text-sky-950",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  danger: "border-red-300 bg-red-50 text-red-900",
};

/**
 * Where toasts are shown. For the feedback of an action that does not change
 * the screen by itself ("Stock guardado"); a message the user has to act on
 * stays on the screen as an Alert instead.
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<readonly ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(({ message, tone = "neutral" }: ToastInput) => {
    const id = nextId.current++;
    // A message already on screen is not stacked twice (two 403 in a row, say).
    setItems((current) =>
      current.some((item) => item.message === message) ? current : [...current, { id, message, tone }],
    );
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Always mounted, so screen readers announce what is added to it. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {items.map((item) => (
          <ToastMessage key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastMessage({ item, onDismiss }: { readonly item: ToastItem; readonly onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), DURATION_MS[item.tone]);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  return (
    <div
      role={item.tone === "danger" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg",
        TOAST_TONES[item.tone],
      )}
    >
      <p className="flex-1">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Cerrar aviso"
        className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
      >
        Cerrar
      </button>
    </div>
  );
}

/** The facade of the toasts. Must be used inside <ToastProvider>. */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (value === null) throw new Error("useToast must be used inside <ToastProvider>.");
  return value;
}
