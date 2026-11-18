import type { ProductRepository } from "../domain/product.repository";

/**
 * Deletes a product for good. The API refuses once the product was sold
 * (ProductHasSalesError), because the sales keep referencing it: the way out
 * is to deactivate it instead, with SetProductActiveUseCase.
 */
export class DeleteProductUseCase {
  constructor(private readonly repository: ProductRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
