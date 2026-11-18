import Link from "next/link";

import type { InventoryRow } from "../application/list-inventory.use-case";
import { INVENTORY_PATH } from "./inventory-search-params";
import { InventoryTable } from "./inventory-table";

/** The products to restock, most urgent first, rendered on the server. */
export function LowStockScreen({ rows }: { readonly rows: readonly InventoryRow[] }) {
  return (
    <section aria-labelledby="low-stock-title" className="flex flex-col gap-6">
      <nav aria-label="Ruta" className="text-muted text-sm">
        <Link href={INVENTORY_PATH} className="hover:underline">
          Productos
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Stock bajo</span>
      </nav>

      <header>
        <h1 id="low-stock-title" className="text-2xl font-semibold">
          Stock bajo
        </h1>
        <p className="text-muted text-sm">
          Productos activos que llegaron a su stock mínimo o están por debajo. Primero los que más
          unidades necesitan.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-900">
          Ningún producto está por debajo de su stock mínimo.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium">
            {rows.length === 1 ? "1 producto por reabastecer" : `${rows.length} productos por reabastecer`}
          </p>
          <InventoryTable rows={rows} />
        </>
      )}
    </section>
  );
}
