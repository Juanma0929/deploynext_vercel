import type { Supplier } from "../domain/supplier";
import type { SupplierRepository } from "../domain/supplier.repository";

/** Every supplier, ordered by name. Pagination and search happen in the front. */
export class ListSuppliersUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  async execute(): Promise<Supplier[]> {
    const suppliers = await this.repository.list();
    return suppliers.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}
