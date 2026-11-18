"use client";

import Link from "next/link";

import { LOW_STOCK_PATH } from "./inventory-search-params";
import { useLowStockCount } from "./use-low-stock-count";

/**
 * The counter of the home page, for every role: how many products are at or
 * below their minimum, with a link to the list. It shows nothing when there
 * are none, while it loads, or if the request failed.
 */
export function LowStockAlert() {
  const count = useLowStockCount();
  if (count === null || count === 0) return null;

  return (
    <aside
      aria-label="Alerta de stock bajo"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white tabular-nums"
      >
        {count}
      </span>
      <p className="flex-1">
        {count === 1
          ? "1 producto está por agotarse."
          : `${count} productos están por agotarse.`}
      </p>
      <Link href={LOW_STOCK_PATH} className="font-medium underline underline-offset-2">
        Ver la lista
      </Link>
    </aside>
  );
}
