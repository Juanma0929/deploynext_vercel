import { browserHttpClient } from "@/shared/di/http";

import { CreateProductUseCase } from "../application/create-product.use-case";
import { ProductHttpRepository } from "../infrastructure/product.http.repository";

export interface ProductsContainer {
  readonly createProduct: CreateProductUseCase;
}

let container: ProductsContainer | null = null;

/** The use cases of products for the browser, wired once. */
export function productsContainer(): ProductsContainer {
  if (container !== null) return container;

  const repository = new ProductHttpRepository(browserHttpClient());

  container = {
    createProduct: new CreateProductUseCase(repository),
  };
  return container;
}
