import type { Supplier } from "./supplier";
import type { NewSupplier, SupplierChanges } from "./supplier-input";
import type { SupplierProduct } from "./supplier-product";

/** The port to /suppliers. Every role may read it; only an admin may write. */
export interface SupplierRepository {
  list(): Promise<Supplier[]>;

  /** Rejects with SupplierNotFoundError on a 404, or a 400 for an id that is not a UUID. */
  findById(id: string): Promise<Supplier>;

  /** The products of the supplier. Rejects with SupplierNotFoundError like findById. */
  listProducts(supplierId: string): Promise<SupplierProduct[]>;

  create(supplier: NewSupplier): Promise<Supplier>;

  /** Rejects with SupplierNotFoundError when the supplier no longer exists. */
  update(id: string, changes: SupplierChanges): Promise<Supplier>;

  /**
   * Rejects with SupplierHasProductsError when products still reference it,
   * and with SupplierNotFoundError when it no longer exists.
   */
  delete(id: string): Promise<void>;
}
