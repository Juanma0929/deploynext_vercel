import type { SupplierRepository } from "../domain/supplier.repository";

/**
 * Deletes a supplier for good. The API refuses while products reference it
 * (SupplierHasProductsError): they have to be moved to another supplier or
 * deleted first.
 */
export class DeleteSupplierUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
