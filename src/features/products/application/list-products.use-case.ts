import type { Product } from "../domain/product";
import type { ProductRepository } from "../domain/product.repository";

/** Every product, active and inactive, ordered by name: the catalog the browser keeps. */
export class ListProductsUseCase {
  constructor(private readonly repository: ProductRepository) {}

  async execute(): Promise<Product[]> {
    const products = await this.repository.list();
    return products.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}
