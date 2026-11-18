import type { Supplier } from "./supplier";

/** The port to /suppliers. Every logged-in role may read it. */
export interface SupplierRepository {
  list(): Promise<Supplier[]>;
}
