import Link from "next/link";

import type { Page } from "@/shared/domain/collections";

interface LinkPaginationProps<T> {
  readonly page: Page<T>;
  /** The URL of another page, keeping the rest of the query. */
  readonly hrefFor: (page: number) => string;
  /** What is being counted, in plural: "productos". */
  readonly noun: string;
}

/**
 * The same "Página 2 de 5 · 43 productos" as Pagination, but with links: for
 * lists whose page lives in the URL and that render on the server.
 */
export function LinkPagination<T>({ page, hrefFor, noun }: LinkPaginationProps<T>) {
  const link = "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100";
  const disabled = "rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-400";

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted">
        Página {page.page} de {page.totalPages} · {page.totalItems} {noun}
      </p>
      <div className="flex gap-2">
        {page.page > 1 ? (
          <Link href={hrefFor(page.page - 1)} className={link} rel="prev">
            Anterior
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            Anterior
          </span>
        )}
        {page.page < page.totalPages ? (
          <Link href={hrefFor(page.page + 1)} className={link} rel="next">
            Siguiente
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
