import type { Product } from "./product";
import type { ProductDraft } from "./product-input";

export interface ProductRepository {
  /** Every product, active and inactive, ordered by name. */
  list(): Promise<Product[]>;
  /** One product. Rejects with ProductNotFoundError if it does not exist. */
  findById(id: string): Promise<Product>;
  /**
   * Creates a product. Rejects with DuplicateBarcodeError (409) or with
   * ProductSupplierNotFoundError (404).
   */
  create(draft: ProductDraft): Promise<Product>;
}

/** The name of a supplier, to show next to its products. */
export interface SupplierName {
  readonly id: string;
  readonly name: string;
}

/**
 * Where products reads the names of the suppliers. It is a port of its own so
 * products does not import the suppliers feature: it asks the API directly.
 */
export interface SupplierNameRepository {
  list(): Promise<SupplierName[]>;
  /** One supplier, or null if it does not exist. */
  findById(id: string): Promise<SupplierName | null>;
}
