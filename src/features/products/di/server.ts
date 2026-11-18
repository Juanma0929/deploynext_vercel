import { cache } from "react";

import { serverHttpClient } from "@/shared/di/http-server";

import {
  GetProductDetailUseCase,
  type ProductDetail,
} from "../application/get-product-detail.use-case";
import {
  ListInventoryUseCase,
  type Inventory,
  type InventoryRow,
} from "../application/list-inventory.use-case";
import { ListLowStockUseCase } from "../application/list-low-stock.use-case";
import { ListSupplierOptionsUseCase } from "../application/list-supplier-options.use-case";
import type { SupplierName } from "../domain/product.repository";
import type { ProductFilters } from "../domain/product-filters";
import {
  ProductHttpRepository,
  SupplierNameHttpRepository,
} from "../infrastructure/product.http.repository";

export type { Inventory, InventoryRow } from "../application/list-inventory.use-case";
export type { ProductDetail } from "../application/get-product-detail.use-case";
export type { SupplierName } from "../domain/product.repository";
export { ProductNotFoundError } from "../domain/errors";

/**
 * The inventory for the server, filtered and paginated. `returnTo` is the URL
 * being rendered, with its query, so a 401 brings the user back to the same
 * filters after logging in again.
 */
export function listInventory(
  filters: ProductFilters,
  page: number,
  returnTo: string,
): Promise<Inventory> {
  const http = serverHttpClient(returnTo);
  const useCase = new ListInventoryUseCase(
    new ProductHttpRepository(http),
    new SupplierNameHttpRepository(http),
  );
  return useCase.execute(filters, page);
}

/** The products to restock, most urgent first, for the server. */
export function listLowStock(returnTo: string): Promise<InventoryRow[]> {
  const http = serverHttpClient(returnTo);
  return new ListLowStockUseCase(
    new ProductHttpRepository(http),
    new SupplierNameHttpRepository(http),
  ).execute();
}

/** The suppliers to choose from in the product form, for the server. */
export function listSupplierOptions(returnTo: string): Promise<SupplierName[]> {
  return new ListSupplierOptionsUseCase(
    new SupplierNameHttpRepository(serverHttpClient(returnTo)),
  ).execute();
}

/**
 * The detail of a product, for the server. cache() makes generateMetadata and
 * the page of the same request share one pair of API calls.
 */
export const getProductDetail = cache((id: string): Promise<ProductDetail> => {
  const http = serverHttpClient(`/productos/${encodeURIComponent(id)}`);
  return new GetProductDetailUseCase(
    new ProductHttpRepository(http),
    new SupplierNameHttpRepository(http),
  ).execute(id);
});
