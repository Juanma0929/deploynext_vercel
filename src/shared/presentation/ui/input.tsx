import type { ComponentProps, ReactNode } from "react";

import { cn } from "./cn";

const CONTROL =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 read-only:bg-slate-100";

/** The ids a Field gives to its hint and its error, to point at them with aria-describedby. */
export function hintId(id: string): string {
  return `${id}-hint`;
}
export function errorId(id: string): string {
  return `${id}-error`;
}

/**
 * The aria-describedby of a control: its hint and its error, the ones that are
 * there. Undefined when there are none, so the attribute is left out.
 */
export function describedBy(
  id: string,
  { hint, error }: { readonly hint?: unknown; readonly error?: unknown },
): string | undefined {
  const ids = [hint ? hintId(id) : "", error ? errorId(id) : ""].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

interface FieldProps {
  /** The id of the control inside, for the label. */
  readonly id: string;
  readonly label: ReactNode;
  readonly error?: string | undefined;
  readonly hint?: ReactNode;
  /** Shows a red "*". */
  readonly required?: boolean;
  /** Shows "(opcional)". */
  readonly optional?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * A label, its control, a hint and an error, laid out the same in every form.
 * The control is passed as children; give it aria-describedby={describedBy(...)}.
 */
export function Field({ id, label, error, hint, required = false, optional = false, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {optional && <span className="text-muted font-normal"> (opcional)</span>}
      </label>
      {children}
      {hint !== undefined && hint !== null && (
        <div id={hintId(id)} className="text-muted text-xs">
          {hint}
        </div>
      )}
      {error !== undefined && (
        <p id={errorId(id)} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type Invalid = { readonly invalid?: boolean };

/** A text input. `invalid` sets aria-invalid, which paints the border red. */
export function TextInput({ invalid, className, ...rest }: ComponentProps<"input"> & Invalid) {
  return <input aria-invalid={invalid || undefined} className={cn(CONTROL, className)} {...rest} />;
}

export function Select({ invalid, className, ...rest }: ComponentProps<"select"> & Invalid) {
  return <select aria-invalid={invalid || undefined} className={cn(CONTROL, className)} {...rest} />;
}

export function Textarea({ invalid, className, ...rest }: ComponentProps<"textarea"> & Invalid) {
  return <textarea aria-invalid={invalid || undefined} className={cn(CONTROL, className)} {...rest} />;
}

/** A checkbox with its label to the right. */
export function Checkbox({
  label,
  className,
  ...rest
}: Omit<ComponentProps<"input">, "type"> & { readonly label: ReactNode }) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <input type="checkbox" className="accent-primary size-4" {...rest} />
      {label}
    </label>
  );
}
