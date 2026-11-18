"use client";

import { onDataChanged } from "@/shared/presentation/data-changes";
import { createResource } from "@/shared/presentation/store";

import { suppliersContainer } from "../di/container";

/**
 * The store of suppliers: a cached catalog. It is loaded once and shared by
 * every screen that needs suppliers (the list, the names next to products);
 * a write marks it stale, and logging out empties it.
 */
export const suppliersCatalog = createResource(() => suppliersContainer().listSuppliers.execute());

onDataChanged("suppliers", () => suppliersCatalog.invalidate());
