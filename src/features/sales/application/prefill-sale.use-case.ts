import { isUuid } from "@/shared/domain/uuid";

import { SaleNotFoundError } from "../domain/errors";
import { SaleDraft, type DraftAdjustment } from "../domain/sale-draft";
import type { SaleProduct } from "../domain/sale-product";
import type { SaleProductCatalog, SaleRepository } from "../domain/sale.repository";

export interface PrefilledSale {
  /** The sellable products, to keep editing the cart. */
  readonly products: readonly SaleProduct[];
  readonly draft: SaleDraft;
  /** What could not be copied as it was: products gone, or stock that is short. */
  readonly adjustments: readonly DraftAdjustment[];
}

/**
 * The cart of a new sale, filled with the items of an earlier one. It is how
 * a declined sale is tried again: a sale is charged only once, so the retry
 * is a new sale, and the declined one already gave its stock back.
 */
export class PrefillSaleUseCase {
  constructor(
    private readonly repository: SaleRepository,
    private readonly catalog: SaleProductCatalog,
  ) {}

  async execute(saleId: string): Promise<PrefilledSale> {
    if (!isUuid(saleId)) throw new SaleNotFoundError();

    const [sale, catalog] = await Promise.all([this.repository.findById(saleId), this.catalog.list()]);

    const names = new Map(catalog.map((product) => [product.id, product.name]));
    // The same list the picker shows on a new sale: sellable, ordered by name.
    const products = catalog
      .filter((product) => product.isSellable)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
    const { draft, adjustments } = SaleDraft.fromItems(
      sale.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      products,
      names,
    );

    return { products, draft, adjustments };
  }
}
