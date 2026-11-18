import Link from "next/link";
import type { ReactNode } from "react";

import type { SupplierDetail } from "../application/get-supplier-detail.use-case";
import { SUPPLIER_PRODUCTS_ANCHOR } from "./supplier-anchors";

interface SupplierDetailViewProps {
  readonly detail: SupplierDetail;
  /** Buttons for the header, such as "Editar". The route decides who sees them. */
  readonly actions?: ReactNode;
}

/** A supplier, how to reach it and the products it supplies. Rendered on the server. */
export function SupplierDetailView({ detail, actions }: SupplierDetailViewProps) {
  const { supplier, products } = detail;
  const lowStockCount = products.filter((product) => product.isActive && product.isLowStock).length;

  return (
    <article aria-labelledby="supplier-title" className="flex flex-col gap-6">
      <nav aria-label="Ruta de navegación" className="text-sm">
        <Link href="/proveedores" className="text-primary hover:underline">
          ← Proveedores
        </Link>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="supplier-title" className="text-2xl font-semibold">
          {supplier.name}
        </h1>
        {actions}
      </header>

      <section aria-labelledby="supplier-contact-title" className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 id="supplier-contact-title" className="mb-3 text-sm font-semibold">
          Datos de contacto
        </h2>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Item label="Contacto">{supplier.contactName}</Item>
          <Item label="Teléfono">
            {supplier.phone !== null && (
              <a href={`tel:${supplier.phone.replace(/\s+/g, "")}`} className="hover:underline">
                {supplier.phone}
              </a>
            )}
          </Item>
          <Item label="Correo">
            {supplier.email !== null && (
              <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                {supplier.email}
              </a>
            )}
          </Item>
          <Item label="Dirección">{supplier.address}</Item>
        </dl>
      </section>

      <section
        id={SUPPLIER_PRODUCTS_ANCHOR}
        aria-labelledby="supplier-products-title"
        className="flex scroll-mt-6 flex-col gap-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="supplier-products-title" className="text-lg font-semibold">
            Productos que suministra
          </h2>
          <p className="text-muted text-sm">
            {products.length} {products.length === 1 ? "producto" : "productos"}
            {lowStockCount > 0 && (
              <span className="text-amber-700"> · {lowStockCount} con stock bajo</span>
            )}
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
            Este proveedor todavía no tiene productos asociados.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Producto</th>
                  <th scope="col" className="px-4 py-3 font-medium">Categoría</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Precio de venta</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Stock</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className={product.isActive ? undefined : "text-muted"}>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category ?? <Missing />}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{product.salePrice.format()}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                      {product.currentStock}
                      <span className="text-muted text-xs"> / mín. {product.minimumStock}</span>
                    </td>
                    <td className="px-4 py-3">
                      {!product.isActive ? (
                        <Badge tone="muted">Inactivo</Badge>
                      ) : product.isLowStock ? (
                        <Badge tone="warning">Stock bajo</Badge>
                      ) : (
                        <Badge tone="ok">Disponible</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}

function Item({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  const isEmpty = children === null || children === false || children === undefined;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted text-xs">{label}</dt>
      <dd>{isEmpty ? <Missing /> : children}</dd>
    </div>
  );
}

function Missing() {
  return (
    <span className="text-slate-400" aria-label="Sin dato">
      —
    </span>
  );
}

const BADGE_TONES = {
  ok: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  muted: "bg-slate-200 text-slate-700",
} as const;

function Badge({ tone, children }: { readonly tone: keyof typeof BADGE_TONES; readonly children: ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}
