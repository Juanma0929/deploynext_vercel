import { isUuid } from "@/shared/domain/uuid";

import { SupplierNotFoundError } from "../domain/errors";
import type { Supplier } from "../domain/supplier";
import type { SupplierRepository } from "../domain/supplier.repository";

/** One supplier, for the edit form. An id that is not a UUID is refused before any request. */
export class GetSupplierUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  execute(id: string): Promise<Supplier> {
    if (!isUuid(id)) return Promise.reject(new SupplierNotFoundError());
    return this.repository.findById(id);
  }
}
