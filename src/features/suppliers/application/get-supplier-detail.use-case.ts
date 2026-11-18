import { isUuid } from "@/shared/domain/uuid";

import { SupplierNotFoundError } from "../domain/errors";
import type { Supplier } from "../domain/supplier";
import type { SupplierProduct } from "../domain/supplier-product";
import type { SupplierRepository } from "../domain/supplier.repository";

export interface SupplierDetail {
  readonly supplier: Supplier;
  /** Ordered by name. */
  readonly products: readonly SupplierProduct[];
}

/**
 * A supplier and the products it supplies, asked for at the same time. An id
 * that is not a UUID can never exist, so it is refused before any request.
 */
export class GetSupplierDetailUseCase {
  constructor(private readonly repository: SupplierRepository) {}

  async execute(id: string): Promise<SupplierDetail> {
    if (!isUuid(id)) throw new SupplierNotFoundError();

    const [supplier, products] = await Promise.all([
      this.repository.findById(id),
      this.repository.listProducts(id),
    ]);

    return {
      supplier,
      products: products.sort((a, b) => a.name.localeCompare(b.name, "es")),
    };
  }
}
