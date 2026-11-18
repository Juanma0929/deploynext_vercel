import type { Sale } from "../domain/sale";
import type { SaleRepository } from "../domain/sale.repository";
import type { Seller, SellerDirectory } from "../domain/seller";

export interface SalesHistory {
  /** Newest first. */
  readonly sales: readonly Sale[];
  /** Ordered by name, for the filter. */
  readonly sellers: readonly Seller[];
  /** The name of each seller by id; a sale may point to one that is not listed. */
  readonly sellerNames: ReadonlyMap<string, string>;
}

/**
 * Every sale and the people who sold them, asked for at the same time. The
 * API sends only the sellerId; the names come from GET /users.
 */
export class ListSalesHistoryUseCase {
  constructor(
    private readonly repository: SaleRepository,
    private readonly sellers: SellerDirectory,
  ) {}

  async execute(): Promise<SalesHistory> {
    const [sales, sellers] = await Promise.all([this.repository.findAll(), this.sellers.list()]);

    return {
      sales: [...sales].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      sellers: [...sellers].sort((a, b) => a.name.localeCompare(b.name, "es")),
      sellerNames: new Map(sellers.map((seller) => [seller.id, seller.name])),
    };
  }
}
