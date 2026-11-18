"use client";

import Link from "next/link";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";

import { SaleStatusBadge } from "./sale-status-badge";
import { useTodaySales } from "./use-today-sales";

const TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/** The home page of a seller: its sales of today and the way to start a new one. */
export function SellerHome() {
  const today = useTodaySales();

  return (
    <section aria-labelledby="seller-home-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="seller-home-title" className="text-2xl font-semibold">
          Tus ventas de hoy
        </h1>
        <Link
          href="/ventas/nueva"
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          Nueva venta
        </Link>
      </header>

      {today.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando tus ventas…
        </p>
      )}

      {today.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{today.message}</p>
          <button type="button" onClick={today.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {today.status === "ready" && (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat label="Ventas" value={String(today.data.summary.count)} />
            <Stat label="Cobrado" value={today.data.summary.paidTotal.format()} />
            <Stat label="Pendientes de cobro" value={String(today.data.summary.pendingCount)} />
          </dl>

          {today.data.sales.length === 0 ? (
            <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
              Todavía no has registrado ventas hoy.
            </p>
          ) : (
            <table className="w-full overflow-hidden rounded-lg bg-white text-sm shadow-sm">
              <caption className="sr-only">Ventas de hoy</caption>
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Hora
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Unidades
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {today.data.sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{TIME_FORMAT.format(sale.createdAt)}</td>
                    <td className="px-4 py-2">{sale.unitCount}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{sale.total.format()}</td>
                    <td className="px-4 py-2">
                      <SaleStatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
