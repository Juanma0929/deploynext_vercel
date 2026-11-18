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
   * One sale with its items. Rejects with SaleNotFoundError (404, or 400 for
   * an id that is not a UUID) or SaleNotYoursError (403: a seller asking for
   * the sale of another seller).
   */
  findById(id: string): Promise<Sale>;

  /**
   * Cancels a pending sale and gives the stock back. Admin only. Rejects with
   * SaleNotCancellableError (409) or SaleNotFoundError.
   */
  cancel(id: string): Promise<Sale>;

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
