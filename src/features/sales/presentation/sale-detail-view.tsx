import type { ReactNode } from "react";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";
import {
  Breadcrumbs,
  DataItem,
  MoneyText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/presentation/ui";

import type { SaleDetail } from "../application/get-sale-detail.use-case";
import { paymentMethodLabel } from "./payment-method-labels";
import { SaleStatusBadge } from "./sale-status-badge";

/** createdAt arrives in UTC; it is shown in Colombian time. */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  timeZone: BUSINESS_TIME_ZONE,
  dateStyle: "long",
  timeStyle: "short",
});

interface SaleDetailViewProps {
  readonly detail: SaleDetail;
  /** "Cobrar" and "Cancelar"; the route decides which, by status and permission. */
  readonly actions?: ReactNode;
}

/** A sale, its items with the product names and how it was paid. Rendered on the server. */
export function SaleDetailView({ detail, actions }: SaleDetailViewProps) {
  const { sale, productNames } = detail;

  return (
    <article aria-labelledby="sale-title" className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Ventas de hoy", href: "/ventas" }, { label: "Venta" }]} />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 id="sale-title" className="text-2xl font-semibold">
              Venta
            </h1>
            <SaleStatusBadge status={sale.status} />
          </div>
          <p className="text-muted text-sm">
            <time dateTime={sale.createdAt.toISOString()}>{DATE_TIME_FORMAT.format(sale.createdAt)}</time>
          </p>
        </div>
        {actions}
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3">
        <DataItem label="Total">
          <MoneyText value={sale.total} className="text-lg font-semibold" />
        </DataItem>
        {sale.paymentMethod !== null && (
          <DataItem label="Método de pago">{paymentMethodLabel(sale.paymentMethod)}</DataItem>
        )}
        {sale.paymentTransactionId !== null && (
          <DataItem label="Transacción">
            <span className="font-mono text-xs break-all">{sale.paymentTransactionId}</span>
          </DataItem>
        )}
      </dl>

      <section aria-labelledby="sale-items-title" className="flex flex-col gap-3">
        <h2 id="sale-items-title" className="text-lg font-semibold">
          Productos
        </h2>
        <Table caption="Productos de la venta">
          <TableHead>
            <TableHeaderCell>Producto</TableHeaderCell>
            <TableHeaderCell align="right">Cantidad</TableHeaderCell>
            <TableHeaderCell align="right">Precio unitario</TableHeaderCell>
            <TableHeaderCell align="right">Subtotal</TableHeaderCell>
          </TableHead>
          <TableBody>
            {sale.lines.map((line) => (
              <TableRow key={line.productId}>
                <TableCell className="font-medium">
                  {productNames.get(line.productId) ?? (
                    <span className="text-muted font-normal">Producto no disponible</span>
                  )}
                </TableCell>
                <TableCell align="right" className="tabular-nums">
                  {line.quantity}
                </TableCell>
                <TableCell align="right">
                  <MoneyText value={line.unitPrice} />
                </TableCell>
                <TableCell align="right">
                  <MoneyText value={line.subtotal} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot className="border-t border-slate-200">
            <tr>
              <th scope="row" colSpan={3} className="px-4 py-3 text-right font-medium">
                Total
              </th>
              <td className="px-4 py-3 text-right font-semibold">
                <MoneyText value={sale.total} />
              </td>
            </tr>
          </tfoot>
        </Table>
        <p className="text-muted text-xs">Los precios son los que tenía cada producto al momento de la venta.</p>
      </section>
    </article>
  );
}
