import Link from "next/link";
import type { ReactNode } from "react";

import { Alert, EmptyState, LinkPagination } from "@/shared/presentation/ui";

import type { Inventory } from "../application/list-inventory.use-case";
import { InventoryFilters } from "./inventory-filters";
import { inventoryHref, LOW_STOCK_PATH, type InventoryQuery } from "./inventory-search-params";
import { InventoryTable } from "./inventory-table";

interface InventoryScreenProps {
  readonly inventory: Inventory;
  readonly query: InventoryQuery;
  /**
   * The actions of the header, such as "Nuevo producto". The route decides
   * them with the permission matrix of auth, so products does not import auth.
   */
  readonly actions?: ReactNode;
  /** The name of a product just deleted, from ?eliminado=, to confirm it. */
  readonly deletedName?: string | undefined;
}

/**
 * The inventory, rendered on the server from the URL: the filters, the page of
 * products and the links to the other pages. It has no client state, so the
 * same URL always shows the same list.
 */
export function InventoryScreen({ inventory, query, actions, deletedName }: InventoryScreenProps) {
  const { page } = inventory;

  return (
    <section aria-labelledby="inventory-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="inventory-title" className="text-2xl font-semibold">
            Productos
          </h1>
          <p className="text-muted text-sm">
            El inventario completo, con los productos activos e inactivos.{" "}
            <Link href={LOW_STOCK_PATH} className="text-primary font-medium hover:underline">
              Ver stock bajo
            </Link>
          </p>
        </div>
        {actions}
      </header>

      {deletedName !== undefined && deletedName !== "" && (
        // It goes away with the next filter or page: those links do not carry ?eliminado=.
        <Alert tone="success">
          <p>Se eliminó el producto {deletedName}.</p>
        </Alert>
      )}

      {/* The key resets the fields when the URL changes, e.g. after "Quitar filtros". */}
      <InventoryFilters
        key={inventoryHref({ ...query, page: 1 })}
        filters={query.filters}
        categories={inventory.categories}
        suppliers={inventory.suppliers}
      />

      {page.items.length === 0 ? (
        <EmptyState>
          {inventory.totalProducts === 0
            ? "Todavía no hay productos registrados."
            : "Ningún producto coincide con los filtros."}
        </EmptyState>
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
