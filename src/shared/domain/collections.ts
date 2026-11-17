import { DomainError } from "./errors";

export interface Page<T> {
  readonly items: readonly T[];
  /** 1-based, already clamped to the pages that exist. */
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  /** At least 1, so an empty list still has a page to show. */
  readonly totalPages: number;
}

/**
 * Cuts one page out of a list. The API does not paginate, so the lists are
 * paginated here.
 *
 * A page out of range is clamped instead of failing, because it usually comes
 * from the URL or from a list that just shrank after a filter.
 */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new DomainError("El tamaño de página debe ser un entero mayor que cero.");
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requested = Number.isFinite(page) ? Math.trunc(page) : 1;
  const current = Math.min(Math.max(requested, 1), totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    totalItems,
    totalPages,
  };
}

export type Predicate<T> = (item: T) => boolean;

/**
 * Keeps the items that pass every active criterion. A criterion that is null
 * or undefined is a filter the user left empty, so it is skipped:
 *
 *   filter(products, [
 *     term === "" ? null : (p) => p.name.includes(term),
 *     onlyLowStock ? (p) => p.isLowStock() : null,
 *   ]);
 */
export function filter<T>(
  items: readonly T[],
  criteria: ReadonlyArray<Predicate<T> | null | undefined>,
): T[] {
  const active = criteria.filter((criterion): criterion is Predicate<T> => criterion != null);
  return items.filter((item) => active.every((criterion) => criterion(item)));
}
