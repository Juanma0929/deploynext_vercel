import { serverHttpClient } from "@/shared/di/http-server";

import { ListInventoryUseCase, type Inventory } from "../application/list-inventory.use-case";
import type { ProductFilters } from "../domain/product-filters";
import {
  ProductHttpRepository,
  SupplierNameHttpRepository,
} from "../infrastructure/product.http.repository";

export type { Inventory, InventoryRow } from "../application/list-inventory.use-case";

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
