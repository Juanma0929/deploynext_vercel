import { browserHttpClient } from "@/shared/di/http";

import { CreateSaleUseCase } from "../application/create-sale.use-case";
import { ListSalesHistoryUseCase } from "../application/list-sales-history.use-case";
import { ListSellableProductsUseCase } from "../application/list-sellable-products.use-case";
import { ListTodaySalesUseCase } from "../application/list-today-sales.use-case";
import { SaleProductCatalogHttpRepository } from "../infrastructure/sale-product-catalog.http.repository";
import { SaleHttpRepository } from "../infrastructure/sale.http.repository";
import { SellerDirectoryHttpRepository } from "../infrastructure/seller-directory.http.repository";

export interface SalesContainer {
  readonly listTodaySales: ListTodaySalesUseCase;
  readonly listSellableProducts: ListSellableProductsUseCase;
  readonly createSale: CreateSaleUseCase;
  readonly listSalesHistory: ListSalesHistoryUseCase;
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
    listSalesHistory: new ListSalesHistoryUseCase(
      repository,
      new SellerDirectoryHttpRepository(http),
    ),
  };
  return container;
}
