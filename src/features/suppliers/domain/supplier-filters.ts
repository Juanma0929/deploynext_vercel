import { filter } from "@/shared/domain/collections";

import type { Supplier } from "./supplier";

/**
 * Keeps the suppliers whose name, contact, email or phone contain the term,
 * ignoring case and accents. An empty term keeps them all.
 */
export function searchSuppliers(suppliers: readonly Supplier[], term: string): Supplier[] {
  const needle = normalize(term);

  return filter(suppliers, [
    needle === ""
      ? null
      : (supplier) =>
          normalize(
            [supplier.name, supplier.contactName, supplier.email, supplier.phone].join(" "),
          ).includes(needle),
  ]);
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}
