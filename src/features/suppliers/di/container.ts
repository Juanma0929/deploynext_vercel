import { browserHttpClient } from "@/shared/di/http";

import { CreateSupplierUseCase } from "../application/create-supplier.use-case";
import { ListSuppliersUseCase } from "../application/list-suppliers.use-case";
import { UpdateSupplierUseCase } from "../application/update-supplier.use-case";
import { SupplierHttpRepository } from "../infrastructure/supplier.http.repository";

export interface SuppliersContainer {
  readonly listSuppliers: ListSuppliersUseCase;
  readonly createSupplier: CreateSupplierUseCase;
  readonly updateSupplier: UpdateSupplierUseCase;
}

let container: SuppliersContainer | null = null;

/** The use cases of suppliers for the browser, wired once. */
export function suppliersContainer(): SuppliersContainer {
  if (container !== null) return container;

  const repository = new SupplierHttpRepository(browserHttpClient());

  container = {
    listSuppliers: new ListSuppliersUseCase(repository),
    createSupplier: new CreateSupplierUseCase(repository),
    updateSupplier: new UpdateSupplierUseCase(repository),
  };
  return container;
}
