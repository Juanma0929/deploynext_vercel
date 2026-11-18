import { LinkPagination } from "@/shared/presentation/link-pagination";

import type { Inventory } from "../application/list-inventory.use-case";
import { InventoryFilters } from "./inventory-filters";
import { inventoryHref, type InventoryQuery } from "./inventory-search-params";
import { InventoryTable } from "./inventory-table";

interface InventoryScreenProps {
  readonly inventory: Inventory;
  readonly query: InventoryQuery;
}

/**
 * The inventory, rendered on the server from the URL: the filters, the page of
 * products and the links to the other pages. It has no client state, so the
 * same URL always shows the same list.
 */
export function InventoryScreen({ inventory, query }: InventoryScreenProps) {
  const { page } = inventory;

  return (
    <section aria-labelledby="inventory-title" className="flex flex-col gap-6">
      <header>
        <h1 id="inventory-title" className="text-2xl font-semibold">
          Productos
        </h1>
        <p className="text-muted text-sm">
          El inventario completo, con los productos activos e inactivos.
        </p>
      </header>

      {/* The key resets the fields when the URL changes, e.g. after "Quitar filtros". */}
      <InventoryFilters
        key={inventoryHref({ ...query, page: 1 })}
        filters={query.filters}
        categories={inventory.categories}
        suppliers={inventory.suppliers}
      />

      {page.items.length === 0 ? (
        <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
          {inventory.totalProducts === 0
            ? "Todavía no hay productos registrados."
            : "Ningún producto coincide con los filtros."}
        </p>
      ) : (
        <InventoryTable rows={page.items} />
      )}

      <LinkPagination
        page={page}
        noun="productos"
        hrefFor={(pageNumber) => inventoryHref({ filters: query.filters, page: pageNumber })}
      />
    </section>
  );
}
