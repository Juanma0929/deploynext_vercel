import { browserHttpClient } from "@/shared/di/http";

import { CreateSaleUseCase } from "../application/create-sale.use-case";
import { ListSellableProductsUseCase } from "../application/list-sellable-products.use-case";
import { ListTodaySalesUseCase } from "../application/list-today-sales.use-case";
import { SaleProductCatalogHttpRepository } from "../infrastructure/sale-product-catalog.http.repository";
import { SaleHttpRepository } from "../infrastructure/sale.http.repository";

export interface SalesContainer {
  readonly listTodaySales: ListTodaySalesUseCase;
  readonly listSellableProducts: ListSellableProductsUseCase;
  readonly createSale: CreateSaleUseCase;
}

let container: SalesContainer | null = null;

/** The use cases of sales for the browser, wired once. */
export function salesContainer(): SalesContainer {
  if (container !== null) return container;

  const http = browserHttpClient();
  const repository = new SaleHttpRepository(http);

  container = {
    listTodaySales: new ListTodaySalesUseCase(repository),
    listSellableProducts: new ListSellableProductsUseCase(new SaleProductCatalogHttpRepository(http)),
    createSale: new CreateSaleUseCase(repository),
  };
  return container;
}
