"use client";

import { useCallback, useMemo } from "react";

import { notifyDataChanged } from "@/shared/presentation/data-changes";
import { useResource } from "@/shared/presentation/store";

import { productsContainer } from "../di/container";
import { Product, type ProductProps } from "../domain/product";
import { productsCatalog } from "./products-store";

export type ProductsCatalogState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly products: readonly Product[] }
  | { readonly status: "error"; readonly message: string };

export interface ProductsFacade {
  readonly catalog: ProductsCatalogState;
  readonly reload: () => void;
  /** The name of a product by id, from the cached catalog; null if it is not there. */
  readonly nameOf: (id: string) => string | null;
  /** How many products need restocking (active, in low stock); null until the catalog loads. */
  readonly lowStockCount: number | null;
  /** Deletes a product. Rejects with ProductHasSalesError (409) or ProductNotFoundError. */
  readonly deleteProduct: (id: string) => Promise<void>;
  /** Deactivates a product, as the way out of a 409 on delete. */
  readonly deactivateProduct: (product: ProductProps) => Promise<void>;
}

/**
 * The facade of products. Components read the catalog and change products
 * only through here (and the form and quick action hooks); every write marks
 * the cached catalog stale.
 */
export function useProducts(): ProductsFacade {
  const state = useResource(productsCatalog, "cached");

  const catalog = useMemo<ProductsCatalogState>(() => {
    if (state.status === "ready") return { status: "ready", products: state.data };
    if (state.status === "error") return { status: "error", message: state.message };
    if (state.status === "loading" && state.previous !== null) return { status: "ready", products: state.previous };
    return { status: "loading" };
  }, [state]);

  const products = catalog.status === "ready" ? catalog.products : null;
  const names = useMemo(() => new Map((products ?? []).map((product) => [product.id, product.name])), [products]);
  const lowStockCount = useMemo(
    () => (products === null ? null : products.filter((product) => product.needsRestock).length),
    [products],
  );

  const nameOf = useCallback((id: string) => names.get(id) ?? null, [names]);
  const reload = useCallback(() => void productsCatalog.reload(), []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsContainer().deleteProduct.execute(id);
    } finally {
      notifyDataChanged("products");
    }
  }, []);

  const deactivateProduct = useCallback(async (product: ProductProps) => {
    await productsContainer().setProductActive.execute(new Product(product), false);
    notifyDataChanged("products");
  }, []);

  return { catalog, reload, nameOf, lowStockCount, deleteProduct, deactivateProduct };
}
