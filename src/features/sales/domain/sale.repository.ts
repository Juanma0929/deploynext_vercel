import type { Sale } from "./sale";
import type { SaleItem } from "./sale-draft";
import type { SaleProduct } from "./sale-product";

export interface SaleRepository {
  /**
   * The sales of today in Colombian time, newest first. A seller gets only its
   * own; an admin gets every one.
   */
  findToday(): Promise<Sale[]>;

  /** Every sale of the business, newest first. Admin only. */
  findAll(): Promise<Sale[]>;

  /**
   * Registers a pending sale and decreases the stock. Rejects with
   * SaleRejectedError when a product is inactive, short of stock or gone.
   */
  create(items: readonly SaleItem[]): Promise<Sale>;
}

/** The products a sale can be made of (GET /products). */
export interface SaleProductCatalog {
  list(): Promise<SaleProduct[]>;
}
