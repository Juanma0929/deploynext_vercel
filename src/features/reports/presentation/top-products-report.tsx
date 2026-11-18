"use client";

import { useId, useState, type FormEvent } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";
import {
  Button,
  EmptyState,
  LoadingText,
  MoneyText,
  RetryAlert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
  describedBy,
  errorId,
} from "@/shared/presentation/ui";

import {
  assertTopProductsLimit,
  profitMargin,
  TOP_PRODUCTS_LIMIT,
  type TopProduct,
} from "../domain/reports";
import { ReportSection } from "./report-section";
import { TopProductsChart } from "./top-products-chart";
import { useReports } from "./use-reports";

/**
 * The best sellers: a bar chart of units sold and a table with what each
 * one brought in and earned. Only paid sales count.
 */
export function TopProductsReport() {
  const limitId = useId();
  const [limit, setLimit] = useState<number>(TOP_PRODUCTS_LIMIT.default);
  const [draft, setDraft] = useState(String(TOP_PRODUCTS_LIMIT.default));
  const [limitError, setLimitError] = useState<string | null>(null);
  const { topProducts: report } = useReports({ topProductsLimit: limit });

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
    <ReportSection
      titleId="top-products-title"
      title="Productos más vendidos"
      description="Por unidades vendidas, con lo que dejó cada uno. Solo cuentan las ventas pagadas."
      actions={
        <form noValidate onSubmit={apply} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={limitId} className="text-sm font-medium">
              Cuántos productos ({TOP_PRODUCTS_LIMIT.min}–{TOP_PRODUCTS_LIMIT.max})
            </label>
            <TextInput
              id={limitId}
              type="number"
              inputMode="numeric"
              min={TOP_PRODUCTS_LIMIT.min}
              max={TOP_PRODUCTS_LIMIT.max}
              step={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              invalid={limitError !== null}
              aria-describedby={describedBy(limitId, { error: limitError })}
              className="w-24"
            />
          </div>
          <Button type="submit">Ver</Button>
        </form>
      }
    >
      {limitError !== null && (
        <p id={errorId(limitId)} role="alert" className="text-xs text-red-600">
          {limitError}
        </p>
      )}

      {report.status === "loading" && <LoadingText>Cargando el reporte…</LoadingText>}

      {report.status === "error" && <RetryAlert message={report.message} onRetry={report.reload} />}

      {report.status === "ready" &&
        (report.data.length === 0 ? (
          <EmptyState>Todavía no hay ventas pagadas para armar el reporte.</EmptyState>
        ) : (
          <>
            <TopProductsChart products={report.data} />
            <TopProductsTable products={report.data} />
          </>
        ))}
    </ReportSection>
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
      <p className="text-muted text-xs">Ingresos y ganancia por producto. La ganancia es lo vendido menos su costo.</p>
      <Table caption="Ingresos y ganancia de los productos más vendidos">
        <TableHead>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>Producto</TableHeaderCell>
          <TableHeaderCell align="right">Unidades</TableHeaderCell>
          <TableHeaderCell align="right">Ingresos</TableHeaderCell>
          <TableHeaderCell align="right">Ganancia</TableHeaderCell>
          <TableHeaderCell align="right">Margen</TableHeaderCell>
        </TableHead>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.productId}>
              <TableCell className="text-muted tabular-nums">{index + 1}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell align="right" className="tabular-nums">
                {product.quantitySold}
              </TableCell>
              <TableCell align="right">
                <MoneyText value={product.revenue} />
              </TableCell>
              <TableCell align="right">
                <MoneyText value={product.profit} highlightNegative />
              </TableCell>
              <TableCell align="right" className="text-muted tabular-nums">
                {formatMargin(profitMargin(product))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <tfoot className="border-t border-slate-200 font-medium">
          <tr>
            <th scope="row" colSpan={2} className="px-4 py-3">
              Total
            </th>
            <td className="px-4 py-3 text-right tabular-nums">{totals.quantitySold}</td>
            <td className="px-4 py-3 text-right">
              <MoneyText value={totals.revenue} />
            </td>
            <td className="px-4 py-3 text-right">
              <MoneyText value={totals.profit} highlightNegative />
            </td>
            <td className="text-muted px-4 py-3 text-right tabular-nums">{formatMargin(profitMargin(totals))}</td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}

const PERCENT = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

function formatMargin(margin: number | null): string {
  return margin === null ? "—" : `${PERCENT.format(margin)} %`;
}
