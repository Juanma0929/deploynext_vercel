import { browserHttpClient } from "@/shared/di/http";

import { AdjustStockUseCase } from "../application/adjust-stock.use-case";
import { CreateProductUseCase } from "../application/create-product.use-case";
import { SetProductActiveUseCase } from "../application/set-product-active.use-case";
import { UpdateProductUseCase } from "../application/update-product.use-case";
import { ProductHttpRepository } from "../infrastructure/product.http.repository";

export interface ProductsContainer {
  readonly createProduct: CreateProductUseCase;
  readonly updateProduct: UpdateProductUseCase;
  readonly adjustStock: AdjustStockUseCase;
  readonly setProductActive: SetProductActiveUseCase;
}

let container: ProductsContainer | null = null;

/** The use cases of products for the browser, wired once. */
export function productsContainer(): ProductsContainer {
  if (container !== null) return container;

  const repository = new ProductHttpRepository(browserHttpClient());

  container = {
    createProduct: new CreateProductUseCase(repository),
    updateProduct: new UpdateProductUseCase(repository),
    adjustStock: new AdjustStockUseCase(repository),
    setProductActive: new SetProductActiveUseCase(repository),
  };
  return container;
}
