"use client";

import { productsCatalog } from "@/features/products/presentation/products-store";
import { suppliersCatalog } from "@/features/suppliers/presentation/suppliers-store";
import { registerNameCatalog } from "@/shared/presentation/name-catalogs";

/**
 * Publishes the cached catalogs of products and suppliers so the other
 * features can show names by id (a sale shows its products' names) without
 * importing those features. The app is the only place that knows both.
 */
registerNameCatalog("products", productsCatalog);
registerNameCatalog("suppliers", suppliersCatalog);

/** Renders nothing: loading this module in the browser is what registers the catalogs. */
export function NameCatalogs() {
  return null;
}
