import type { InventoryRow } from "../application/list-inventory.use-case";

/** The products of one page of the inventory. */
export function InventoryTable({ rows }: { readonly rows: readonly InventoryRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Inventario de productos</caption>
        <thead className="text-muted border-b border-slate-200 text-xs uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Producto</th>
            <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
            <th scope="col" className="px-4 py-3 font-medium">Proveedor</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Precio</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Stock</th>
            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(({ product, supplierName }) => (
            <tr key={product.id} className={product.isActive ? undefined : "bg-slate-50"}>
              <td className="px-4 py-3">
                <span className="font-medium">{product.name}</span>
                {product.barcode !== null && (
                  <span className="text-muted block font-mono text-xs">{product.barcode}</span>
                )}
              </td>
              <td className="px-4 py-3">{product.category ?? <Missing />}</td>
              <td className="px-4 py-3">{supplierName ?? <Missing />}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                {product.salePrice.format()}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <span className="tabular-nums">{product.currentStock}</span>
                <span className="text-muted text-xs"> / mín. {product.minimumStock}</span>
                {product.isLowStock && (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    Stock bajo
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {product.isActive ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                    Activo
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                    Inactivo
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Missing() {
  return (
    <span className="text-slate-400" aria-label="Sin dato">
      —
    </span>
  );
}
