"use client";

import { BUSINESS_TIME_ZONE } from "@/shared/domain/calendar";
import {
  ButtonLink,
  EmptyState,
  LoadingText,
  MoneyText,
  PageHeader,
  RetryAlert,
  Stat,
  StatGrid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/presentation/ui";

import { SaleStatusBadge } from "./sale-status-badge";
import { useSales } from "./use-sales";

const TIME_FORMAT = new Intl.DateTimeFormat("es-CO", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/** The home page of a seller: its sales of today and the way to start a new one. */
export function SellerHome() {
  const { today } = useSales({ today: true });

  return (
    <section aria-labelledby="seller-home-title" className="flex flex-col gap-6">
      <PageHeader
        titleId="seller-home-title"
        title="Tus ventas de hoy"
        actions={<ButtonLink href="/ventas/nueva">Nueva venta</ButtonLink>}
      />

      {today.status === "loading" && <LoadingText>Cargando tus ventas…</LoadingText>}

      {today.status === "error" && <RetryAlert message={today.message} onRetry={today.reload} />}

      {today.status === "ready" && (
        <>
          <StatGrid>
            <Stat label="Ventas" value={today.data.summary.count} />
            <Stat label="Cobrado" value={<MoneyText value={today.data.summary.paidTotal} />} />
            <Stat label="Pendientes de cobro" value={today.data.summary.pendingCount} />
          </StatGrid>

          {today.data.sales.length === 0 ? (
            <EmptyState>Todavía no has registrado ventas hoy.</EmptyState>
          ) : (
            <Table caption="Ventas de hoy">
              <TableHead>
                <TableHeaderCell>Hora</TableHeaderCell>
                <TableHeaderCell>Unidades</TableHeaderCell>
                <TableHeaderCell align="right">Total</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
              </TableHead>
              <TableBody>
                {today.data.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{TIME_FORMAT.format(sale.createdAt)}</TableCell>
                    <TableCell>{sale.unitCount}</TableCell>
                    <TableCell align="right">
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
        </>
      )}
    </section>
  );
}
