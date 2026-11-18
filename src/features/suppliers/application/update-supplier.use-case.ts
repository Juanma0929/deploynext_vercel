import type { Supplier } from "../domain/supplier";
import {
  assertValidSupplier,
  changesBetween,
  hasSupplierChanges,
  type SupplierFormValues,
} from "../domain/supplier-input";
import type { SupplierRepository } from "../domain/supplier.repository";

/** Saves only what changed. With nothing changed, no request is made. */
export class UpdateSupplierUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  async execute(current: Supplier, values: SupplierFormValues): Promise<Supplier> {
    assertValidSupplier(values);

    const changes = changesBetween(current, values);
    if (!hasSupplierChanges(changes)) return current;

    return this.repository.update(current.id, changes);
  }
}
