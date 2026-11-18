"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { BUSINESS_TIME_ZONE, lastDays, todayInColombia } from "@/shared/domain/calendar";
import { paginate } from "@/shared/domain/collections";
import { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";
import {
  Button,
  EmptyState,
  Field,
  LoadingText,
  MoneyText,
  PageHeader,
  Pagination,
  RetryAlert,
  Select,
  Stat,
  StatGrid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@/shared/presentation/ui";

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
      <PageHeader
        titleId="history-title"
        title="Historial de ventas"
        description="Todas las ventas del negocio, de la más reciente a la más antigua. Fechas y horas en hora de Colombia."
        actions={
          <Button variant="secondary" onClick={history.reload} disabled={history.status === "loading"}>
            Actualizar
          </Button>
        }
      />

      <HistoryFilters
        filters={filters}
        sellers={history.status === "ready" ? history.data.sellers : []}
        rangeError={range.ok ? null : range.message}
        hasFilters={hasFilters}
        onChange={change}
        onPreset={preset}
        onClear={() => change(NO_FILTERS)}
      />

      {history.status === "loading" && <LoadingText>Cargando el historial…</LoadingText>}

      {history.status === "error" && <RetryAlert message={history.message} onRetry={history.reload} />}

      {history.status === "ready" && (
        <>
          <StatGrid>
            <Stat label="Ventas" value={summary.count} />
            <Stat label="Total pagado" value={<MoneyText value={summary.paidTotal} />} />
            <Stat label="Pendientes de cobro" value={summary.pendingCount} />
          </StatGrid>

          {page.items.length === 0 ? (
            <EmptyState>
              {sales.length === 0 ? "Todavía no hay ventas registradas." : "Ninguna venta coincide con los filtros."}
            </EmptyState>
          ) : (
            <Table caption="Historial de ventas">
              <TableHead>
                <TableHeaderCell>Fecha y hora</TableHeaderCell>
                <TableHeaderCell>Vendedor</TableHeaderCell>
                <TableHeaderCell align="right">Ítems</TableHeaderCell>
                <TableHeaderCell align="right">Total</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
              </TableHead>
              <TableBody>
                {page.items.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      <Link href={`/ventas/${sale.id}`} className="text-primary hover:underline">
                        <time dateTime={sale.createdAt.toISOString()}>{DATE_TIME_FORMAT.format(sale.createdAt)}</time>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {history.data.sellerNames.get(sale.sellerId) ?? (
                        <span className="text-muted">Usuario desconocido</span>
                      )}
                    </TableCell>
                    <TableCell align="right" className="tabular-nums">
                      {sale.itemCount}
                    </TableCell>
                    <TableCell align="right" className="font-medium">
                      <MoneyText value={sale.total} />
                    </TableCell>
                    <TableCell>
                      <SaleStatusBadge status={sale.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

const PRESETS = [
  { days: 1, label: "Hoy" },
  { days: 7, label: "Últimos 7 días" },
  { days: 30, label: "Últimos 30 días" },
] as const;

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
  const rangeDescribedBy = rangeError !== null ? ids.error : undefined;

  return (
    <search className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field id={ids.from} label="Desde">
          <TextInput
            id={ids.from}
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
            invalid={rangeError !== null}
            aria-describedby={rangeDescribedBy}
          />
        </Field>
        <Field id={ids.to} label="Hasta">
          <TextInput
            id={ids.to}
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
            invalid={rangeError !== null}
            aria-describedby={rangeDescribedBy}
          />
        </Field>
        <Field id={ids.status} label="Estado">
          <Select
            id={ids.status}
            value={filters.status ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ status: isSaleStatus(value) ? value : null });
            }}
          >
            <option value="">Todos</option>
            {SALE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {SALE_STATUS_PLURALS[status]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={ids.seller} label="Vendedor">
          <Select
            id={ids.seller}
            value={filters.sellerId ?? ""}
            onChange={(event) => onChange({ sellerId: event.target.value || null })}
          >
            <option value="">Todos</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
                {seller.isActive ? "" : " (inactivo)"}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {rangeError !== null && (
        <p id={ids.error} role="alert" className="text-xs text-red-600">
          {rangeError} El rango no se está aplicando.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted text-xs">Rápido:</span>
        {PRESETS.map((item) => (
          <Button
            key={item.days}
            variant="secondary"
            size="sm"
            className="rounded-full text-xs"
            onClick={() => onPreset(item.days)}
          >
            {item.label}
          </Button>
        ))}
        {hasFilters && (
          <Button variant="link" onClick={onClear} className="text-primary ml-auto text-xs">
            Limpiar filtros
          </Button>
        )}
      </div>
    </search>
  );
}
