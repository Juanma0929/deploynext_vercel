import { filter } from "@/shared/domain/collections";
import { normalizeForSearch } from "@/shared/domain/text";

import type { Product } from "./product";

export const PRODUCT_STATUSES = ["all", "active", "inactive"] as const;
export type ProductStatusFilter = (typeof PRODUCT_STATUSES)[number];

/** What the user can filter the inventory by. Empty values mean "any". */
export interface ProductFilters {
  /** Part of the name or of the barcode. */
  readonly term: string;
  readonly category: string;
  readonly supplierId: string;
  readonly status: ProductStatusFilter;
  readonly lowStockOnly: boolean;
}

export const NO_PRODUCT_FILTERS: ProductFilters = {
  term: "",
  category: "",
  supplierId: "",
  status: "all",
  lowStockOnly: false,
};

/** Keeps the products that pass every filter that is set. */
export function filterProducts(products: readonly Product[], filters: ProductFilters): Product[] {
  const needle = normalizeForSearch(filters.term);
  const category = normalizeForSearch(filters.category);

  return filter(products, [
    needle === ""
      ? null
      : (product) =>
          normalizeForSearch(product.name).includes(needle) ||
          (product.barcode !== null && normalizeForSearch(product.barcode).includes(needle)),
    category === ""
      ? null
      : (product) => product.category !== null && normalizeForSearch(product.category) === category,
    filters.supplierId === "" ? null : (product) => product.supplierId === filters.supplierId,
    filters.status === "all"
      ? null
      : (product) => product.isActive === (filters.status === "active"),
    filters.lowStockOnly ? (product) => product.isLowStock : null,
  ]);
}

/**
 * The categories to filter by. There is no table of categories in the API (it
 * is free text on each product), so they are the distinct categories of the
 * products, in alphabetical order. "Lácteos" and "lacteos" count as one.
 */
export function categoriesOf(products: readonly Product[]): string[] {
  const byKey = new Map<string, string>();
  for (const product of products) {
    if (product.category === null) continue;
    const key = normalizeForSearch(product.category);
    if (!byKey.has(key)) byKey.set(key, product.category);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "es"));
}
