import Link from "next/link";

import type { Page } from "@/shared/domain/collections";

import { buttonClasses } from "./button";
import { cn } from "./cn";

interface PaginationSummaryProps<T> {
  readonly page: Page<T>;
  /** What is being counted, in plural: "usuarios", "productos". */
  readonly noun: string;
}

function Summary<T>({ page, noun }: PaginationSummaryProps<T>) {
  return (
    <p className="text-muted">
      Página {page.page} de {page.totalPages} · {page.totalItems} {noun}
    </p>
  );
}

const DISABLED = cn(buttonClasses("secondary", "sm"), "pointer-events-none border-slate-200 text-slate-400");

interface PaginationProps<T> extends PaginationSummaryProps<T> {
  readonly onPageChange: (page: number) => void;
}

/**
 * "Página 2 de 5 · 43 usuarios" with previous and next, for a list whose page
 * lives in client state. It needs a handler, so the screen that uses it is a
 * Client Component; the component itself has no state.
 */
export function Pagination<T>({ page, onPageChange, noun }: PaginationProps<T>) {
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <Summary page={page} noun={noun} />
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClasses("secondary", "sm")}
          disabled={page.page <= 1}
          onClick={() => onPageChange(page.page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className={buttonClasses("secondary", "sm")}
          disabled={page.page >= page.totalPages}
          onClick={() => onPageChange(page.page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}

interface LinkPaginationProps<T> extends PaginationSummaryProps<T> {
  /** The URL of another page, keeping the rest of the query. */
  readonly hrefFor: (page: number) => string;
}

/**
 * The same as Pagination, but with links: for lists whose page lives in the
 * URL and that render on the server.
 */
export function LinkPagination<T>({ page, hrefFor, noun }: LinkPaginationProps<T>) {
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <Summary page={page} noun={noun} />
      <div className="flex gap-2">
        {page.page > 1 ? (
          <Link href={hrefFor(page.page - 1)} className={buttonClasses("secondary", "sm")} rel="prev">
            Anterior
          </Link>
        ) : (
          <span className={DISABLED} aria-disabled="true">
            Anterior
          </span>
        )}
        {page.page < page.totalPages ? (
          <Link href={hrefFor(page.page + 1)} className={buttonClasses("secondary", "sm")} rel="next">
            Siguiente
          </Link>
        ) : (
          <span className={DISABLED} aria-disabled="true">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
