import type { Product } from "../domain/product";
import {
  changesBetween,
  hasProductChanges,
  type ProductFormValues,
} from "../domain/product-input";
import type { ProductRepository } from "../domain/product.repository";

/**
 * Saves the form of a product, sending only what changed. The rules of a new
 * product apply too (InvalidProductError). With nothing changed, no request
 * is made.
 */
export class UpdateProductUseCase {
  constructor(private readonly repository: ProductRepository) {}

  async execute(current: Product, values: ProductFormValues): Promise<Product> {
    const changes = changesBetween(current, values);
    if (!hasProductChanges(changes)) return current;

    return this.repository.update(current.id, changes);
  }
}
