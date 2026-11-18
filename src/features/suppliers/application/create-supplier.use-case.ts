import type { Supplier } from "../domain/supplier";
import { assertValidSupplier, toNewSupplier, type SupplierFormValues } from "../domain/supplier-input";
import type { SupplierRepository } from "../domain/supplier.repository";

/** Creates a supplier. Empty optional fields are not sent, so they stay null. */
export class CreateSupplierUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  async execute(values: SupplierFormValues): Promise<Supplier> {
    assertValidSupplier(values);
    return this.repository.create(toNewSupplier(values));
  }
}
