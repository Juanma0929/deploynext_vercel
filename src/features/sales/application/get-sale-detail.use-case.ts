import { isUuid } from "@/shared/domain/uuid";

import { SaleNotFoundError } from "../domain/errors";
import type { Sale } from "../domain/sale";
import type { SaleProductCatalog, SaleRepository } from "../domain/sale.repository";

export interface SaleDetail {
  readonly sale: Sale;
  /**
   * The name of each product by id, from the catalog. A sale keeps only the
   * productId, so a product deleted since then has no name here.
   */
  readonly productNames: ReadonlyMap<string, string>;
}

/**
 * A sale and the names of its products. The catalog is a nicety: if it
 * fails, the sale is still shown, without names.
 */
export class GetSaleDetailUseCase {
  constructor(
    private readonly repository: SaleRepository,
    private readonly catalog: SaleProductCatalog,
  ) {}

  async execute(id: string): Promise<SaleDetail> {
    if (!isUuid(id)) throw new SaleNotFoundError();

    const [sale, products] = await Promise.all([
      this.repository.findById(id),
      this.catalog.list().catch(() => []),
    ]);

    return {
      sale,
      productNames: new Map(products.map((product) => [product.id, product.name])),
    };
  }
}
