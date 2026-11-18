import { isUuid } from "@/shared/domain/uuid";

import { ProductNotFoundError } from "../domain/errors";
import type { Product } from "../domain/product";
import type { ProductRepository } from "../domain/product.repository";

export interface ProductDetail {
  readonly product: Product;
}

/**
 * A product. An id that is not a UUID is refused before any request. The name
 * of its supplier is not asked here: the view reads it from the cached catalog
 * of suppliers of the browser, so opening a product costs one request, not two.
 */
export class GetProductDetailUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<ProductDetail> {
    if (!isUuid(id)) throw new ProductNotFoundError();
    return { product: await this.products.findById(id) };
  }
}
