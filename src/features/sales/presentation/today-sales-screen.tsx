"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";
import { paginate } from "@/shared/domain/collections";
import {
  Button,
  ButtonLink,
  EmptyState,
  FilterChip,
  LoadingText,
  MoneyText,
  PageHeader,
  Pagination,
  RetryAlert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/presentation/ui";

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
      <PageHeader
        titleId="today-sales-title"
        title="Ventas de hoy"
        description={
          seesEverySeller ? "Todas las ventas del negocio registradas hoy." : "Las ventas que registraste hoy."
        }
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={today.reload} disabled={today.status === "loading"}>
              Actualizar
            </Button>
            <ButtonLink href="/ventas/nueva">Nueva venta</ButtonLink>
          </div>
        }
      />

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar por estado</legend>
        <FilterChip label="Todas" count={sales.length} isActive={status === null} onSelect={() => chooseStatus(null)} />
        {SALE_STATUSES.map((value) => (
          <FilterChip
            key={value}
            label={SALE_STATUS_PLURALS[value]}
            count={counts[value]}
            isActive={status === value}
            onSelect={() => chooseStatus(value)}
          />
        ))}
      </fieldset>

      {today.status === "loading" && <LoadingText>Cargando las ventas de hoy…</LoadingText>}

      {today.status === "error" && <RetryAlert message={today.message} onRetry={today.reload} />}

      {today.status === "ready" && (
        <>
          {page.items.length === 0 ? (
            <EmptyState>
              {sales.length === 0 ? "Todavía no hay ventas registradas hoy." : "No hay ventas de hoy con ese estado."}
            </EmptyState>
          ) : (
            <Table caption="Ventas de hoy">
              <TableHead>
                <TableHeaderCell>Hora</TableHeaderCell>
                <TableHeaderCell align="right">Total</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell align="right">Ítems</TableHeaderCell>
              </TableHead>
              <TableBody>
                {page.items.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="tabular-nums">
                      <Link href={`/ventas/${sale.id}`} className="text-primary font-medium hover:underline">
                        {TIME_FORMAT.format(sale.createdAt)}
                      </Link>
                    </TableCell>
                    <TableCell align="right" className="font-medium">
                      <MoneyText value={sale.total} />
                    </TableCell>
                    <TableCell>
                      <SaleStatusBadge status={sale.status} />
                    </TableCell>
                    <TableCell align="right" className="tabular-nums">
                      {sale.itemCount}
                      <span className="text-muted text-xs">
                        {" "}
                        ({sale.unitCount} {sale.unitCount === 1 ? "unidad" : "unidades"})
                      </span>
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
