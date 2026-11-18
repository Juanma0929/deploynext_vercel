"use client";

import Link from "next/link";

import { isOutOfStock, unitsToMinimum } from "../domain/reports";
import { useLowStockReport } from "./use-low-stock-report";

/**
 * The active products at or below their minimum, most urgent first, with the
 * supplier that the API sends with each row. The status says it in words as
 * well as in color.
 */
export function LowStockReport() {
  const lowStock = useLowStockReport();

  return (
    <section
      aria-labelledby="low-stock-report-title"
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="low-stock-report-title" className="text-lg font-semibold">
            Stock bajo
          </h2>
          <p className="text-muted text-sm">
            Productos activos con el stock en su mínimo o por debajo, los más urgentes primero.
          </p>
        </div>
        <button
          type="button"
          onClick={lowStock.reload}
          disabled={lowStock.status === "loading"}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
        >
          Actualizar
        </button>
      </header>

      {lowStock.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando el reporte…
        </p>
      )}

      {lowStock.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{lowStock.message}</p>
          <button type="button" onClick={lowStock.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {lowStock.status === "ready" &&
        (lowStock.report.products.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-green-800">
            ✓ Ningún producto está en su stock mínimo. No hay nada por reponer.
          </p>
        ) : (
          <>
            <p className="text-sm">
              <strong className="tabular-nums">{lowStock.report.products.length}</strong>{" "}
              {lowStock.report.products.length === 1 ? "producto por reponer" : "productos por reponer"}
              {lowStock.report.outOfStockCount > 0 && (
                <>
                  , <strong className="tabular-nums text-red-700">{lowStock.report.outOfStockCount}</strong>{" "}
                  {lowStock.report.outOfStockCount === 1 ? "agotado" : "agotados"}
                </>
              )}
              .
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Productos con stock bajo</caption>
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Producto</th>
                    <th scope="col" className="px-3 py-2 font-medium">Proveedor</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Stock actual</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Mínimo</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Faltan para el mínimo</th>
                    <th scope="col" className="px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStock.report.products.map((product) => {
                    const outOfStock = isOutOfStock(product);
                    return (
                      <tr key={product.productId}>
                        <td className="px-3 py-2 font-medium">
                          <Link href={`/productos/${product.productId}`} className="text-primary hover:underline">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`/proveedores/${product.supplierId}`} className="hover:underline">
                            {product.supplierName}
                          </Link>
                        </td>
                        <td className={`px-3 py-2 text-right tabular-nums ${outOfStock ? "font-semibold text-red-700" : ""}`}>
                          {product.currentStock}
                        </td>
                        <td className="text-muted px-3 py-2 text-right tabular-nums">{product.minimumStock}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{unitsToMinimum(product)}</td>
                        <td className="px-3 py-2">
                          {outOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                              <span aria-hidden="true">●</span> Agotado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                              <span aria-hidden="true">▲</span> Stock bajo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </section>
  );
}
