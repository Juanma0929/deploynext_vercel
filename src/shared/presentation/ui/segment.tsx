"use client";

import { Button } from "./button";
import { StatusPage } from "./layout";

interface SegmentErrorProps {
  /** What could not be shown: "No se pudo cargar el inventario". */
  readonly title: string;
  /** The retry() an error.tsx receives: it fetches and renders the segment again. */
  readonly retry: () => void;
}

/**
 * The body of an error.tsx. In production the message of a server error never
 * reaches the browser (only a digest), so the text is always our own.
 */
export function SegmentError({ title, retry }: SegmentErrorProps) {
  return (
    <StatusPage role="alert" titleId="segment-error-title" title={title} action={<Button onClick={retry}>Reintentar</Button>}>
      <p>El servidor no respondió como esperábamos. Revisa tu conexión e inténtalo de nuevo.</p>
    </StatusPage>
  );
}

/** The body of a loading.tsx: a skeleton of a title and a list, and what is loading for screen readers. */
export function SegmentLoading({ label }: { readonly label: string }) {
  return (
    <section aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
      <p role="status" className="sr-only">
        {label}
      </p>
    </section>
  );
}
