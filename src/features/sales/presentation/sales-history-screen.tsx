"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { BUSINESS_TIME_ZONE, lastDays, todayInColombia } from "@/shared/domain/calendar";
import { paginate } from "@/shared/domain/collections";
import { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";
import { Pagination } from "@/shared/presentation/pagination";

import { summarizeSales, type Sale } from "../domain/sale";
import { filterSaleHistory } from "../domain/sale-history-filters";
import { SALE_STATUSES, isSaleStatus, type SaleStatus } from "../domain/sale-status";
import { SaleStatusBadge } from "./sale-status-badge";
import { SALE_STATUS_PLURALS } from "./sale-status-labels";
import { useSalesHistory } from "./use-sales-history";

const PAGE_SIZE = 15;
const NO_SALES: readonly Sale[] = [];

/** createdAt arrives in UTC; it is always shown in Colombian time. */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  timeZone: BUSINESS_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Open ends of the range: a filter with only "desde" or only "hasta". */
const EARLIEST_DAY = "1970-01-01";
const LATEST_DAY = "9999-12-31";

interface Filters {
  /** YYYY-MM-DD as the date inputs give it, "" when empty. */
  readonly from: string;
  readonly to: string;
  readonly status: SaleStatus | null;
  readonly sellerId: string | null;
}

const NO_FILTERS: Filters = { from: "", to: "", status: null, sellerId: null };

/** Every sale of the business, filtered in the front. Admin only (sales:history). */
export function SalesHistoryScreen() {
  const history = useSalesHistory();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);

  const sales = history.status === "ready" ? history.data.sales : NO_SALES;

  const range = useMemo(() => toRange(filters.from, filters.to), [filters.from, filters.to]);
  const filtered = useMemo(
    () =>
      filterSaleHistory(sales, {
        range: range.ok ? range.value : null,
        status: filters.status,
        sellerId: filters.sellerId,
      }),
    [sales, range, filters.status, filters.sellerId],
  );
  const summary = useMemo(() => summarizeSales(filtered), [filtered]);
  const page = useMemo(() => paginate(filtered, pageNumber, PAGE_SIZE), [filtered, pageNumber]);

  function change(next: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPageNumber(1);
  }

  function preset(days: number) {
    const last = lastDays(todayInColombia(new Date()), days);
    change({ from: last.from, to: last.to });
  }

  const hasFilters =
    filters.from !== "" || filters.to !== "" || filters.status !== null || filters.sellerId !== null;

  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="history-title" className="text-2xl font-semibold">
            Historial de ventas
          </h1>
          <p className="text-muted text-sm">
            Todas las ventas del negocio, de la más reciente a la más antigua. Fechas y horas en hora
            de Colombia.
          </p>
        </div>
        <button
          type="button"
          onClick={history.reload}
          disabled={history.status === "loading"}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
        >
          Actualizar
        </button>
      </header>

      <HistoryFilters
        filters={filters}
        sellers={history.status === "ready" ? history.data.sellers : []}
        rangeError={range.ok ? null : range.message}
        hasFilters={hasFilters}
        onChange={change}
        onPreset={preset}
        onClear={() => change(NO_FILTERS)}
      />

      {history.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando el historial…
        </p>
      )}

      {history.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{history.message}</p>
          <button type="button" onClick={history.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {history.status === "ready" && (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat label="Ventas" value={String(summary.count)} />
            <Stat label="Total pagado" value={summary.paidTotal.format()} />
            <Stat label="Pendientes de cobro" value={String(summary.pendingCount)} />
          </dl>

          {page.items.length === 0 ? (
            <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
              {sales.length === 0
                ? "Todavía no hay ventas registradas."
                : "Ninguna venta coincide con los filtros."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Historial de ventas</caption>
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Fecha y hora</th>
                    <th scope="col" className="px-4 py-3 font-medium">Vendedor</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Ítems</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                    <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page.items.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        <Link href={`/ventas/${sale.id}`} className="text-primary hover:underline">
                          <time dateTime={sale.createdAt.toISOString()}>
                            {DATE_TIME_FORMAT.format(sale.createdAt)}
                          </time>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {history.data.sellerNames.get(sale.sellerId) ?? (
                          <span className="text-muted">Usuario desconocido</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{sale.itemCount}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{sale.total.format()}</td>
                      <td className="px-4 py-3">
                        <SaleStatusBadge status={sale.status} />
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

type RangeResult =
  | { readonly ok: true; readonly value: DateRange | null }
  | { readonly ok: false; readonly message: string };

/** An empty end is open. The range is refused (and not applied) when "desde" is after "hasta". */
function toRange(from: string, to: string): RangeResult {
  if (from === "" && to === "") return { ok: true, value: null };
  try {
    return { ok: true, value: DateRange.create(from || EARLIEST_DAY, to || LATEST_DAY) };
  } catch (error: unknown) {
    return { ok: false, message: errorMessage(error) };
  }
}

interface HistoryFiltersProps {
  readonly filters: Filters;
  readonly sellers: readonly { readonly id: string; readonly name: string; readonly isActive: boolean }[];
  readonly rangeError: string | null;
  readonly hasFilters: boolean;
  readonly onChange: (next: Partial<Filters>) => void;
  readonly onPreset: (days: number) => void;
  readonly onClear: () => void;
}

function HistoryFilters({
  filters,
  sellers,
  rangeError,
  hasFilters,
  onChange,
  onPreset,
  onClear,
}: HistoryFiltersProps) {
  const ids = { from: useId(), to: useId(), status: useId(), seller: useId(), error: useId() };
  const control =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";
  const chip = "rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-100";

  return (
    <search className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.from} className="text-xs font-medium">Desde</label>
          <input
            id={ids.from}
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
            aria-invalid={rangeError !== null}
            aria-describedby={rangeError !== null ? ids.error : undefined}
            className={control}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.to} className="text-xs font-medium">Hasta</label>
          <input
            id={ids.to}
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
            aria-invalid={rangeError !== null}
            aria-describedby={rangeError !== null ? ids.error : undefined}
            className={control}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.status} className="text-xs font-medium">Estado</label>
          <select
            id={ids.status}
            value={filters.status ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ status: isSaleStatus(value) ? value : null });
            }}
            className={control}
          >
            <option value="">Todos</option>
            {SALE_STATUSES.map((status) => (
              <option key={status} value={status}>{SALE_STATUS_PLURALS[status]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.seller} className="text-xs font-medium">Vendedor</label>
          <select
            id={ids.seller}
            value={filters.sellerId ?? ""}
            onChange={(event) => onChange({ sellerId: event.target.value || null })}
            className={control}
          >
            <option value="">Todos</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
                {seller.isActive ? "" : " (inactivo)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rangeError !== null && (
        <p id={ids.error} role="alert" className="text-xs text-red-600">
          {rangeError} El rango no se está aplicando.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted text-xs">Rápido:</span>
        <button type="button" className={chip} onClick={() => onPreset(1)}>Hoy</button>
        <button type="button" className={chip} onClick={() => onPreset(7)}>Últimos 7 días</button>
        <button type="button" className={chip} onClick={() => onPreset(30)}>Últimos 30 días</button>
        {hasFilters && (
          <button type="button" onClick={onClear} className="text-primary ml-auto text-xs font-medium hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>
    </search>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
