import type { Product } from "../domain/product";
import type { ProductRepository } from "../domain/product.repository";

/**
 * Activates or deactivates a product, sending only isActive. An inactive
 * product stays in the inventory but cannot be sold.
 */
export class SetProductActiveUseCase {
  constructor(private readonly repository: ProductRepository) {}

  async execute(current: Product, isActive: boolean): Promise<Product> {
    if (current.isActive === isActive) return current;
    return this.repository.update(current.id, { isActive });
  }
}
