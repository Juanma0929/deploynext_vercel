import { ValidationError, errorMessage } from "@/shared/domain/errors";

export interface FormErrors<F extends string> {
  /** The message of each field of the form the API refused. */
  readonly fields: Partial<Record<F, string>>;
  /** What goes above the form: what did not belong to any field, or null. */
  readonly message: string | null;
}

/**
 * Spreads a failure over a form. A 400 of the API (ValidationError) puts each
 * message next to its field, when the form has that field; the rest, and any
 * other error, goes above the form. Nothing the API said is lost.
 *
 * `fields` are the names of the form fields, which are the names the API uses.
 */
export function formErrorsFrom<F extends string>(error: unknown, fields: readonly F[]): FormErrors<F> {
  if (!(error instanceof ValidationError)) return { fields: {}, message: errorMessage(error) };

  const known = new Set<string>(fields);
  const unmatched = Object.entries(error.fieldErrors)
    .filter(([field]) => !known.has(field))
    .map(([, message]) => message);
  const matched = error.errorsFor(fields);
  const hasMatches = Object.keys(matched).length > 0;

  return {
    fields: matched,
    message: unmatched.length > 0 ? unmatched.join(" ") : hasMatches ? null : error.message,
  };
}
