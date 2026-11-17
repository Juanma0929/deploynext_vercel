"use client";

interface ErrorProps {
  readonly error: Error;
  readonly reset: () => void;
}

/**
 * The error state of the protected area, by convention instead of a flag in
 * every page. The message comes written for the user: the HTTP client turns
 * each status into an application error with its own text.
 */
export default function ProtectedError({ error, reset }: ErrorProps) {
  return (
    <section role="alert" className="flex flex-col items-start gap-3">
      <h1 className="text-lg font-semibold">No pudimos cargar esta sección</h1>
      <p className="text-muted text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="border-border hover:bg-surface rounded-md border px-3 py-1.5 text-sm"
      >
        Intentar de nuevo
      </button>
    </section>
  );
}
