import { browserHttpClient } from "@/shared/di/http";

import { ListTodaySalesUseCase } from "../application/list-today-sales.use-case";
import { SaleHttpRepository } from "../infrastructure/sale.http.repository";

export interface SalesContainer {
  readonly listTodaySales: ListTodaySalesUseCase;
}

let container: SalesContainer | null = null;

/** The use cases of sales for the browser, wired once. */
export function salesContainer(): SalesContainer {
  if (container !== null) return container;

  const repository = new SaleHttpRepository(browserHttpClient());

  container = {
    listTodaySales: new ListTodaySalesUseCase(repository),
  };
  return container;
}
