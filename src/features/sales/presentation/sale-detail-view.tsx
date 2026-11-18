import Link from "next/link";
import type { ReactNode } from "react";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";

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
      <nav aria-label="Ruta de navegación" className="text-sm">
        <Link href="/ventas" className="text-primary hover:underline">
          ← Ventas de hoy
        </Link>
      </nav>

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
        <Item label="Total">
          <span className="text-lg font-semibold tabular-nums">{sale.total.format()}</span>
        </Item>
        {sale.paymentMethod !== null && (
          <Item label="Método de pago">{paymentMethodLabel(sale.paymentMethod)}</Item>
        )}
        {sale.paymentTransactionId !== null && (
          <Item label="Transacción">
            <span className="font-mono text-xs break-all">{sale.paymentTransactionId}</span>
          </Item>
        )}
      </dl>

      <section aria-labelledby="sale-items-title" className="flex flex-col gap-3">
        <h2 id="sale-items-title" className="text-lg font-semibold">
          Productos
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-muted border-b border-slate-200 text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Producto</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Precio unitario</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.lines.map((line) => (
                <tr key={line.productId}>
                  <td className="px-4 py-3 font-medium">
                    {productNames.get(line.productId) ?? (
                      <span className="text-muted font-normal">Producto no disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{line.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{line.unitPrice.format()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{line.subtotal.format()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200">
              <tr>
                <th scope="row" colSpan={3} className="px-4 py-3 text-right font-medium">
                  Total
                </th>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{sale.total.format()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-muted text-xs">
          Los precios son los que tenía cada producto al momento de la venta.
        </p>
      </section>
    </article>
  );
}

function Item({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted text-xs">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
