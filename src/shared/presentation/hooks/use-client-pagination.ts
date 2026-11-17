"use client";

import { useMemo, useState } from "react";

interface ClientPagination<T> {
  readonly page: number;
  readonly pageCount: number;
  readonly pageItems: readonly T[];
  readonly setPage: (page: number) => void;
}

/**
 * Cuts a list into pages in the browser.
 *
 * The API returns whole lists today, so this is where the pagination happens.
 * It is kept in one hook, and behind the same contract a paginated endpoint
 * would give, so moving to server-side pages later only changes who fills it.
 */
export function useClientPagination<T>(
  items: readonly T[],
  pageSize = 10,
): ClientPagination<T> {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // A filter can shrink the list while the user is on the last page, which
  // would otherwise leave them looking at nothing.
  const current = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  return {
    page: current,
    pageCount,
    pageItems,
    setPage: (next: number) => setPage(Math.min(Math.max(next, 1), pageCount)),
  };
}
