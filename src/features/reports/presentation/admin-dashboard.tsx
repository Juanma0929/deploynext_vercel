"use client";

import type { ReactNode } from "react";

import {
  ButtonLink,
  LoadingText,
  MoneyText,
  PageHeader,
  Panel,
  RetryAlert,
  Stat,
  StatGrid,
} from "@/shared/presentation/ui";

import { DASHBOARD_DAYS } from "../application/get-admin-dashboard.use-case";
import { useReports } from "./use-reports";

/** The home page of an admin: a summary of the reports and the way to see them all. */
export function AdminDashboard() {
  const { dashboard } = useReports({ dashboard: true });

  return (
    <section aria-labelledby="admin-dashboard-title" className="flex flex-col gap-6">
      <PageHeader
        titleId="admin-dashboard-title"
        title="Panel del negocio"
        description={`Ventas pagadas de los últimos ${DASHBOARD_DAYS} días.`}
        actions={
          <ButtonLink href="/reportes" variant="secondary">
            Ver reportes
          </ButtonLink>
        }
      />

      {dashboard.status === "loading" && <LoadingText>Cargando los reportes…</LoadingText>}

      {dashboard.status === "error" && <RetryAlert message={dashboard.message} onRetry={dashboard.reload} />}

      {dashboard.status === "ready" && (
        <>
          <StatGrid className="sm:grid-cols-4">
            <Stat label="Ventas" value={dashboard.data.sales.salesCount} />
            <Stat label="Ingresos" value={<MoneyText value={dashboard.data.sales.revenue} />} />
            <Stat label="Ganancia" value={<MoneyText value={dashboard.data.sales.profit} highlightNegative />} />
            <Stat label="Con stock bajo" value={dashboard.data.lowStock.length} />
          </StatGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Más vendidos">
              {dashboard.data.topProducts.length === 0 ? (
                <Empty>Todavía no hay ventas pagadas.</Empty>
              ) : (
                <ol className="divide-y divide-slate-100">
                  {dashboard.data.topProducts.map((product, index) => (
                    <li key={product.productId} className="flex items-center gap-3 py-2 text-sm">
                      <span className="text-muted w-5 tabular-nums">{index + 1}.</span>
                      <span className="flex-1">{product.name}</span>
                      <span className="text-muted tabular-nums">{product.quantitySold} u.</span>
                      <MoneyText value={product.revenue} className="w-28 text-right" />
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <Panel title="Por agotarse">
              {dashboard.data.lowStock.length === 0 ? (
                <Empty>Ningún producto está por debajo de su stock mínimo.</Empty>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {dashboard.data.lowStock.map((product) => (
                    <li key={product.productId} className="flex items-center gap-3 py-2 text-sm">
                      <span className="flex-1">
                        {product.name}
                        <span className="text-muted block text-xs">{product.supplierName}</span>
                      </span>
                      <span className="font-medium text-red-700 tabular-nums">
                        {product.currentStock} / mín. {product.minimumStock}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}

/** An empty panel: quieter than EmptyState, since it sits inside a box already. */
function Empty({ children }: { readonly children: ReactNode }) {
  return <p className="text-muted py-4 text-center text-sm">{children}</p>;
}
