import { browserHttpClient } from "@/shared/di/http";

import { AdjustStockUseCase } from "../application/adjust-stock.use-case";
import { CreateProductUseCase } from "../application/create-product.use-case";
import { DeleteProductUseCase } from "../application/delete-product.use-case";
import { ListProductsUseCase } from "../application/list-products.use-case";
import { SetProductActiveUseCase } from "../application/set-product-active.use-case";
import { UpdateProductUseCase } from "../application/update-product.use-case";
import { ProductHttpRepository } from "../infrastructure/product.http.repository";

export interface ProductsContainer {
  readonly listProducts: ListProductsUseCase;
  readonly createProduct: CreateProductUseCase;
  readonly updateProduct: UpdateProductUseCase;
  readonly adjustStock: AdjustStockUseCase;
  readonly setProductActive: SetProductActiveUseCase;
  readonly deleteProduct: DeleteProductUseCase;
}

let container: ProductsContainer | null = null;

/** The use cases of products for the browser, wired once. */
export function productsContainer(): ProductsContainer {
  if (container !== null) return container;

  const repository = new ProductHttpRepository(browserHttpClient());

  container = {
    listProducts: new ListProductsUseCase(repository),
    createProduct: new CreateProductUseCase(repository),
    updateProduct: new UpdateProductUseCase(repository),
    adjustStock: new AdjustStockUseCase(repository),
    setProductActive: new SetProductActiveUseCase(repository),
    deleteProduct: new DeleteProductUseCase(repository),
  };
  return container;
}
