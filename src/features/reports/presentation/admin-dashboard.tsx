"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DASHBOARD_DAYS } from "../application/get-admin-dashboard.use-case";
import { useAdminDashboard } from "./use-admin-dashboard";

/** The home page of an admin: a summary of the reports and the way to see them all. */
export function AdminDashboard() {
  const dashboard = useAdminDashboard();

  return (
    <section aria-labelledby="admin-dashboard-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="admin-dashboard-title" className="text-2xl font-semibold">
            Panel del negocio
          </h1>
          <p className="text-muted text-sm">
            Ventas pagadas de los últimos {DASHBOARD_DAYS} días.
          </p>
        </div>
        <Link
          href="/reportes"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Ver reportes
        </Link>
      </header>

      {dashboard.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando los reportes…
        </p>
      )}

      {dashboard.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{dashboard.message}</p>
          <button type="button" onClick={dashboard.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {dashboard.status === "ready" && (
        <>
          <dl className="grid gap-3 sm:grid-cols-4">
            <Stat label="Ventas" value={String(dashboard.data.sales.salesCount)} />
            <Stat label="Ingresos" value={dashboard.data.sales.revenue.format()} />
            <Stat label="Ganancia" value={dashboard.data.sales.profit.format()} />
            <Stat label="Con stock bajo" value={String(dashboard.data.lowStock.length)} />
          </dl>

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
                      <span className="w-28 text-right tabular-nums">
                        {product.revenue.format()}
                      </span>
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

function Stat({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { readonly children: ReactNode }) {
  return <p className="text-muted py-4 text-center text-sm">{children}</p>;
}
