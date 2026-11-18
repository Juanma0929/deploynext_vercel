import { isUuid } from "@/shared/domain/uuid";

import { ProductNotFoundError } from "../domain/errors";
import type { Product } from "../domain/product";
import type {
  ProductRepository,
  SupplierName,
  SupplierNameRepository,
} from "../domain/product.repository";

export interface ProductDetail {
  readonly product: Product;
  /** Null if the supplier of the product no longer exists. */
  readonly supplier: SupplierName | null;
}

/**
 * A product with its supplier. An id that is not a UUID is refused before any
 * request; the supplier is asked once the product says which one it is.
 */
export class GetProductDetailUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly suppliers: SupplierNameRepository,
  ) {}

  async execute(id: string): Promise<ProductDetail> {
    if (!isUuid(id)) throw new ProductNotFoundError();

    const product = await this.products.findById(id);
    const supplier = await this.suppliers.findById(product.supplierId);
    return { product, supplier };
  }
}
