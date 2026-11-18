import type { Product } from "../domain/product";
import { hasProductChanges, stockAdjustment } from "../domain/product-input";
import type { ProductRepository } from "../domain/product.repository";

/**
 * The quick adjustment of the stock, for a count of the shelf: it sends only
 * currentStock. The same number as before makes no request.
 */
export class AdjustStockUseCase {
  constructor(private readonly repository: ProductRepository) {}

  async execute(current: Product, newStock: string): Promise<Product> {
    const changes = stockAdjustment(current, newStock);
    if (!hasProductChanges(changes)) return current;

    return this.repository.update(current.id, changes);
  }
}
