import { filter } from "@/shared/domain/collections";
import { normalizeForSearch } from "@/shared/domain/text";

import type { Supplier } from "./supplier";

/**
 * Keeps the suppliers whose name, contact, email or phone contain the term,
 * ignoring case and accents. An empty term keeps them all.
 */
export function searchSuppliers(suppliers: readonly Supplier[], term: string): Supplier[] {
  const needle = normalizeForSearch(term);

  return filter(suppliers, [
    needle === ""
      ? null
      : (supplier) =>
          normalizeForSearch(
            [supplier.name, supplier.contactName, supplier.email, supplier.phone].join(" "),
          ).includes(needle),
  ]);
}
