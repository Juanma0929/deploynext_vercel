"use client";

import { onDataChanged } from "@/shared/presentation/data-changes";
import { createResource } from "@/shared/presentation/store";

import { productsContainer } from "../di/container";

/**
 * The store of products: a cached catalog of every product, active or not.
 * It is loaded once and shared by every screen of the browser that needs
 * products (the low stock alert, the names by id). A write to a product, or a
 * sale that moves the stock, marks it stale; logging out empties it.
 */
export const productsCatalog = createResource(() => productsContainer().listProducts.execute());

onDataChanged("products", () => productsCatalog.invalidate());
