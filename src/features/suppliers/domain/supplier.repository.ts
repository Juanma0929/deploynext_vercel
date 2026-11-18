import type { Supplier } from "./supplier";
import type { SupplierProduct } from "./supplier-product";

/** The port to /suppliers. Every logged-in role may read it. */
export interface SupplierRepository {
  list(): Promise<Supplier[]>;

  /** Rejects with SupplierNotFoundError on a 404, or a 400 for an id that is not a UUID. */
  findById(id: string): Promise<Supplier>;

  /** The products of the supplier. Rejects with SupplierNotFoundError like findById. */
  listProducts(supplierId: string): Promise<SupplierProduct[]>;
}
