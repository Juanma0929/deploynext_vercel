"use client";

import type { Page } from "@/shared/domain/collections";

interface PaginationProps<T> {
  readonly page: Page<T>;
  readonly onPageChange: (page: number) => void;
  /** What is being counted, in plural: "usuarios", "productos". */
  readonly noun: string;
}

/** "Página 2 de 5 · 43 usuarios" with previous and next. */
export function Pagination<T>({ page, onPageChange, noun }: PaginationProps<T>) {
  const button =
    "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted">
        Página {page.page} de {page.totalPages} · {page.totalItems} {noun}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          disabled={page.page <= 1}
          onClick={() => onPageChange(page.page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className={button}
          disabled={page.page >= page.totalPages}
          onClick={() => onPageChange(page.page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
