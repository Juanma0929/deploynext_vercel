import Link from "next/link";
import type { ReactNode } from "react";

import type { ProductDetail } from "../application/get-product-detail.use-case";
import { INVENTORY_PATH } from "./inventory-search-params";

interface ProductDetailViewProps {
  readonly detail: ProductDetail;
}

/** One product: its prices with the margin, its stock and its supplier. */
export function ProductDetailView({ detail }: ProductDetailViewProps) {
  const { product, supplier } = detail;
  const margin = product.margin;

  return (
    <article aria-labelledby="product-title" className="flex flex-col gap-6">
      <nav aria-label="Ruta" className="text-muted text-sm">
        <Link href={INVENTORY_PATH} className="hover:underline">
          Productos
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 id="product-title" className="text-2xl font-semibold">
            {product.name}
          </h1>
          {product.isActive ? (
            <Badge tone="bg-emerald-100 text-emerald-900">Activo</Badge>
          ) : (
            <Badge tone="bg-slate-200 text-slate-700">Inactivo</Badge>
          )}
          {product.isLowStock && <Badge tone="bg-red-100 text-red-800">Stock bajo</Badge>}
        </div>
        {product.description !== null && <p className="text-muted">{product.description}</p>}
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Precio de venta" value={product.salePrice.format()} />
        <Stat label="Precio de compra" value={product.purchasePrice.format()} />
        <Stat
          label="Margen por unidad"
          value={margin.format()}
          hint="Precio de venta − precio de compra"
          valueClassName={margin.isNegative() ? "text-red-700" : undefined}
        />
      </dl>

      <section aria-labelledby="product-data-title" className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 id="product-data-title" className="mb-3 font-semibold">
          Datos del producto
        </h2>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="Proveedor">
            {supplier !== null ? (
              <Link href={`/proveedores/${supplier.id}`} className="text-primary hover:underline">
                {supplier.name}
              </Link>
            ) : (
              <Missing>Proveedor no disponible</Missing>
            )}
          </Field>
          <Field label="Categoría">{product.category ?? <Missing>Sin categoría</Missing>}</Field>
          <Field label="Código de barras">
            {product.barcode !== null ? (
              <span className="font-mono">{product.barcode}</span>
            ) : (
              <Missing>Sin código</Missing>
            )}
          </Field>
          <Field label="Stock">
            <span className="tabular-nums">{product.currentStock}</span>
            <span className="text-muted"> unidades · mínimo {product.minimumStock}</span>
          </Field>
        </dl>
      </section>
    </article>
  );
}

function Stat({
  label,
  value,
  hint,
  valueClassName,
}: {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly valueClassName?: string | undefined;
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold tabular-nums ${valueClassName ?? ""}`}>{value}</dd>
      {hint !== undefined && <dd className="text-muted mt-1 text-xs">{hint}</dd>}
    </div>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function Badge({ tone, children }: { readonly tone: string; readonly children: ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{children}</span>;
}

function Missing({ children }: { readonly children: ReactNode }) {
  return <span className="text-slate-400">{children}</span>;
}
