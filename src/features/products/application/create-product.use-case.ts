import type { Product } from "../domain/product";
import { toProductDraft, type ProductFormValues } from "../domain/product-input";
import type { ProductRepository } from "../domain/product.repository";

/**
 * Creates a product. The rules are checked before any request: a product that
 * breaks one is refused with InvalidProductError and never reaches the API.
 */
export class CreateProductUseCase {
  constructor(private readonly repository: ProductRepository) {}

  execute(values: ProductFormValues): Promise<Product> {
    return this.repository.create(toProductDraft(values));
  }
}
