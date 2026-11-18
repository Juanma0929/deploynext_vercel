import { Alert, Breadcrumbs, PageHeader } from "@/shared/presentation/ui";

import type { InventoryRow } from "../application/list-inventory.use-case";
import { INVENTORY_PATH } from "./inventory-search-params";
import { InventoryTable } from "./inventory-table";

/** The products to restock, most urgent first, rendered on the server. */
export function LowStockScreen({ rows }: { readonly rows: readonly InventoryRow[] }) {
  return (
    <section aria-labelledby="low-stock-title" className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Productos", href: INVENTORY_PATH }, { label: "Stock bajo" }]} />

      <PageHeader
        titleId="low-stock-title"
        title="Stock bajo"
        description="Productos activos que llegaron a su stock mínimo o están por debajo. Primero los que más unidades necesitan."
      />

      {rows.length === 0 ? (
        <Alert tone="success" className="justify-center text-center">
          <p>Ningún producto está por debajo de su stock mínimo.</p>
        </Alert>
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
