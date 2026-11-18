import { browserHttpClient } from "@/shared/di/http";

import { ListSuppliersUseCase } from "../application/list-suppliers.use-case";
import { SupplierHttpRepository } from "../infrastructure/supplier.http.repository";

export interface SuppliersContainer {
  readonly listSuppliers: ListSuppliersUseCase;
}

let container: SuppliersContainer | null = null;

/** The use cases of suppliers for the browser, wired once. */
export function suppliersContainer(): SuppliersContainer {
  if (container !== null) return container;

  const repository = new SupplierHttpRepository(browserHttpClient());

  container = {
    listSuppliers: new ListSuppliersUseCase(repository),
  };
  return container;
}
