"use client";

import { cn } from "../cn";
import { Button } from "./button";

interface PaginationProps {
  /** One-based, like the numbers the user reads. */
  readonly page: number;
  readonly pageCount: number;
  readonly onPageChange: (page: number) => void;
  readonly className?: string;
}

/** At most this many numbered buttons; the rest are reached with the arrows. */
const WINDOW = 5;

function pageNumbers(page: number, pageCount: number): number[] {
  const first = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), pageCount - WINDOW + 1));
  const last = Math.min(pageCount, first + WINDOW - 1);

  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

/**
 * Numbered pagination. The API returns whole lists today, so the pages are cut
 * in the browser; the component only knows which page is shown and how many
 * there are, which is the same contract a paginated endpoint would give it.
 */
export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Paginación" className={cn("flex items-center gap-1", className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        Anterior
      </Button>

      {pageNumbers(page, pageCount).map((number) => (
        <Button
          key={number}
          variant={number === page ? "primary" : "ghost"}
          size="sm"
          onClick={() => onPageChange(number)}
          aria-current={number === page ? "page" : undefined}
        >
          {number}
        </Button>
      ))}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Página siguiente"
      >
        Siguiente
      </Button>
    </nav>
  );
}
