"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";
import { paginate } from "@/shared/domain/collections";
import { Pagination } from "@/shared/presentation/pagination";

import { countByStatus, filterSalesByStatus } from "../domain/sale-filters";
import { SALE_STATUSES, type SaleStatus } from "../domain/sale-status";
import type { Sale } from "../domain/sale";
import { SaleStatusBadge } from "./sale-status-badge";
import { SALE_STATUS_PLURALS } from "./sale-status-labels";
import { useTodaySales } from "./use-today-sales";

const PAGE_SIZE = 10;
const NO_SALES: readonly Sale[] = [];

const TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

interface TodaySalesScreenProps {
  /**
   * Whether the user sees the sales of every seller (an admin) or only its
   * own (a seller). The API already answers by role; this only sets the copy.
   * The route reads it from the permission matrix (sales:read-all).
   */
  readonly seesEverySeller: boolean;
}

/** The sales of today in Colombian time, newest first, filtered by status in the front. */
export function TodaySalesScreen({ seesEverySeller }: TodaySalesScreenProps) {
  const today = useTodaySales();
  const [status, setStatus] = useState<SaleStatus | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const sales = today.status === "ready" ? today.data.sales : NO_SALES;
  const counts = useMemo(() => countByStatus(sales), [sales]);
  const page = useMemo(
    () => paginate(filterSalesByStatus(sales, status), pageNumber, PAGE_SIZE),
    [sales, status, pageNumber],
  );

  function chooseStatus(next: SaleStatus | null) {
    setStatus(next);
    setPageNumber(1);
  }

  return (
    <section aria-labelledby="today-sales-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="today-sales-title" className="text-2xl font-semibold">
            Ventas de hoy
          </h1>
          <p className="text-muted text-sm">
            {seesEverySeller
              ? "Todas las ventas del negocio registradas hoy."
              : "Las ventas que registraste hoy."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={today.reload}
            disabled={today.status === "loading"}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
          >
            Actualizar
          </button>
          <Link
            href="/ventas/nueva"
            className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Nueva venta
          </Link>
        </div>
      </header>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar por estado</legend>
        <StatusChip label="Todas" count={sales.length} isActive={status === null} onSelect={() => chooseStatus(null)} />
        {SALE_STATUSES.map((value) => (
          <StatusChip
            key={value}
            label={SALE_STATUS_PLURALS[value]}
            count={counts[value]}
            isActive={status === value}
            onSelect={() => chooseStatus(value)}
          />
        ))}
      </fieldset>

      {today.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando las ventas de hoy…
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
          {page.items.length === 0 ? (
            <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
              {sales.length === 0
                ? "Todavía no hay ventas registradas hoy."
                : "No hay ventas de hoy con ese estado."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Ventas de hoy</caption>
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Hora</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                    <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Ítems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page.items.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 tabular-nums">
                        <Link href={`/ventas/${sale.id}`} className="text-primary font-medium hover:underline">
                          {TIME_FORMAT.format(sale.createdAt)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{sale.total.format()}</td>
                      <td className="px-4 py-3">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {sale.itemCount}
                        <span className="text-muted text-xs">
                          {" "}
                          ({sale.unitCount} {sale.unitCount === 1 ? "unidad" : "unidades"})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} onPageChange={setPageNumber} noun="ventas" />
        </>
      )}
    </section>
  );
}

interface StatusChipProps {
  readonly label: string;
  readonly count: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

function StatusChip({ label, count, isActive, onSelect }: StatusChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`rounded-full border px-3 py-1 text-sm ${
        isActive
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-slate-300 bg-white hover:bg-slate-100"
      }`}
    >
      {label} <span className="tabular-nums">({count})</span>
    </button>
  );
}
