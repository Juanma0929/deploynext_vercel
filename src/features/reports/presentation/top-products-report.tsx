"use client";

import { useId, useState, type FormEvent } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

import {
  assertTopProductsLimit,
  profitMargin,
  TOP_PRODUCTS_LIMIT,
  type TopProduct,
} from "../domain/reports";
import { TopProductsChart } from "./top-products-chart";
import { useTopProducts } from "./use-top-products";

/**
 * The best sellers: a bar chart of units sold and a table with what each
 * one brought in and earned. Only paid sales count.
 */
export function TopProductsReport() {
  const limitId = useId();
  const [limit, setLimit] = useState<number>(TOP_PRODUCTS_LIMIT.default);
  const [draft, setDraft] = useState(String(TOP_PRODUCTS_LIMIT.default));
  const [limitError, setLimitError] = useState<string | null>(null);
  const report = useTopProducts(limit);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim() === "" ? Number.NaN : Number(draft);
    try {
      assertTopProductsLimit(value);
    } catch (error: unknown) {
      setLimitError(errorMessage(error));
      return;
    }
    setLimitError(null);
    setLimit(value);
  }

  return (
    <section aria-labelledby="top-products-title" className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="top-products-title" className="text-lg font-semibold">
            Productos más vendidos
          </h2>
          <p className="text-muted text-sm">
            Por unidades vendidas, con lo que dejó cada uno. Solo cuentan las ventas pagadas.
          </p>
        </div>

        <form noValidate onSubmit={apply} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={limitId} className="text-xs font-medium">
              Cuántos productos ({TOP_PRODUCTS_LIMIT.min}–{TOP_PRODUCTS_LIMIT.max})
            </label>
            <input
              id={limitId}
              type="number"
              inputMode="numeric"
              min={TOP_PRODUCTS_LIMIT.min}
              max={TOP_PRODUCTS_LIMIT.max}
              step={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={limitError !== null}
              aria-describedby={limitError !== null ? `${limitId}-error` : undefined}
              className="focus:border-primary focus:ring-primary/20 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 aria-[invalid=true]:border-red-500"
            />
          </div>
          <button type="submit" className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white">
            Ver
          </button>
        </form>
      </header>

      {limitError !== null && (
        <p id={`${limitId}-error`} role="alert" className="text-xs text-red-600">
          {limitError}
        </p>
      )}

      {report.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando el reporte…
        </p>
      )}

      {report.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{report.message}</p>
          <button type="button" onClick={report.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {report.status === "ready" &&
        (report.products.length === 0 ? (
          <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
            Todavía no hay ventas pagadas para armar el reporte.
          </p>
        ) : (
          <>
            <TopProductsChart products={report.products} />
            <TopProductsTable products={report.products} />
          </>
        ))}
    </section>
  );
}

function TopProductsTable({ products }: { readonly products: readonly TopProduct[] }) {
  const totals = {
    quantitySold: products.reduce((sum, product) => sum + product.quantitySold, 0),
    revenue: Money.sum(products.map((product) => product.revenue)),
    profit: Money.sum(products.map((product) => product.profit)),
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted text-xs">
        Ingresos y ganancia por producto. La ganancia es lo vendido menos su costo.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">Ingresos y ganancia de los productos más vendidos</caption>
          <thead className="text-muted border-b border-slate-200 text-xs uppercase">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">#</th>
              <th scope="col" className="px-3 py-2 font-medium">Producto</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Unidades</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Ingresos</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Ganancia</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Margen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => (
              <tr key={product.productId}>
                <td className="text-muted px-3 py-2 tabular-nums">{index + 1}</td>
                <td className="px-3 py-2 font-medium">{product.name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{product.quantitySold}</td>
                <td className="px-3 py-2 text-right tabular-nums">{product.revenue.format()}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${product.profit.isNegative() ? "text-red-700" : ""}`}>
                  {product.profit.format()}
                </td>
                <td className="text-muted px-3 py-2 text-right tabular-nums">{formatMargin(profitMargin(product))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 font-medium">
            <tr>
              <th scope="row" colSpan={2} className="px-3 py-2">
                Total
              </th>
              <td className="px-3 py-2 text-right tabular-nums">{totals.quantitySold}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.revenue.format()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.profit.format()}</td>
              <td className="text-muted px-3 py-2 text-right tabular-nums">{formatMargin(profitMargin(totals))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const PERCENT = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

function formatMargin(margin: number | null): string {
  return margin === null ? "—" : `${PERCENT.format(margin)} %`;
}
