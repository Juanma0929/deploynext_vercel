import type { SupplierName, SupplierNameRepository } from "../domain/product.repository";

/** The suppliers a product can be assigned to, ordered by name. */
export class ListSupplierOptionsUseCase {
  constructor(private readonly suppliers: SupplierNameRepository) {}

  async execute(): Promise<SupplierName[]> {
    const suppliers = await this.suppliers.list();
    return suppliers.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}
