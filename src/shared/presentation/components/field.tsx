import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";

import { cn } from "../cn";

interface FieldShellProps {
  readonly label: string;
  readonly hint?: string;
  /** The message shown under the field. Its presence is what marks it invalid. */
  readonly error?: string;
  readonly htmlFor: string;
  readonly children: ReactNode;
}

const CONTROL = [
  "w-full rounded-md border px-3 py-2 text-base outline-none",
  "border-border bg-surface focus:border-primary",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-danger",
].join(" ");

function FieldShell({ label, hint, error, htmlFor, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint !== undefined && error === undefined && (
        <span className="text-muted text-xs">{hint}</span>
      )}
      {error !== undefined && (
        <span role="alert" className="text-danger text-xs">
          {error}
        </span>
      )}
    </div>
  );
}

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * A labelled input with room for a hint and for the error of that one field.
 * The label is tied to the control with a generated id, so clicking it focuses
 * the input and a screen reader announces the pair.
 */
export function InputField({ label, hint, error, className, ...rest }: InputFieldProps) {
  const id = useId();

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <input
        id={id}
        aria-invalid={error !== undefined}
        className={cn(CONTROL, className)}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly options: readonly SelectOption[];
  /** The first, empty option. Leave it out when the field is required. */
  readonly placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  ...rest
}: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <select
        id={id}
        aria-invalid={error !== undefined}
        className={cn(CONTROL, className)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...rest
}: TextAreaFieldProps) {
  const id = useId();

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <textarea
        id={id}
        aria-invalid={error !== undefined}
        className={cn(CONTROL, "min-h-20 resize-y", className)}
        {...rest}
      />
    </FieldShell>
  );
}
