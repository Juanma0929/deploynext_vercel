import type { SaleProductCatalog } from "../domain/sale.repository";
import type { SaleProduct } from "../domain/sale-product";

/** The products the picker offers: active and with stock, ordered by name. */
export class ListSellableProductsUseCase {
  constructor(private readonly catalog: SaleProductCatalog) {}

  async execute(): Promise<SaleProduct[]> {
    const products = await this.catalog.list();
    return products
      .filter((product) => product.isSellable)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}
