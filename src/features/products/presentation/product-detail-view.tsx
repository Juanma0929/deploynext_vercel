import type { ReactNode } from "react";

import { CatalogName } from "@/shared/presentation/catalog-name";
import { Breadcrumbs, DataItem, MissingValue, MoneyText, Panel, Stat, StatGrid } from "@/shared/presentation/ui";

import type { ProductDetail } from "../application/get-product-detail.use-case";
import { INVENTORY_PATH } from "./inventory-search-params";
import { LowStockBadge, ProductStatusBadge } from "./product-badges";

interface ProductDetailViewProps {
  readonly detail: ProductDetail;
  /**
   * What only an admin sees: the actions of the header ("Editar") and the
   * quick adjustments below the data. The route decides them with the
   * permission matrix of auth, so products does not import auth.
   */
  readonly actions?: ReactNode;
  readonly adminPanel?: ReactNode;
}

/** One product: its prices with the margin, its stock and its supplier. */
export function ProductDetailView({ detail, actions, adminPanel }: ProductDetailViewProps) {
  const { product } = detail;

  return (
    <article aria-labelledby="product-title" className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Productos", href: INVENTORY_PATH }, { label: product.name }]} />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id="product-title" className="text-2xl font-semibold">
              {product.name}
            </h1>
            <ProductStatusBadge isActive={product.isActive} />
            {product.isLowStock && <LowStockBadge />}
          </div>
          {product.description !== null && <p className="text-muted">{product.description}</p>}
        </div>
        {actions}
      </header>

      <StatGrid>
        <Stat label="Precio de venta" value={<MoneyText value={product.salePrice} />} />
        <Stat label="Precio de compra" value={<MoneyText value={product.purchasePrice} />} />
        <Stat
          label="Margen por unidad"
          value={<MoneyText value={product.margin} highlightNegative />}
          hint="Precio de venta − precio de compra"
        />
      </StatGrid>

      <Panel title="Datos del producto" titleId="product-data-title">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <DataItem label="Proveedor">
            <CatalogName
              catalog="suppliers"
              id={product.supplierId}
              fallback={<MissingValue>Proveedor no disponible</MissingValue>}
              href={`/proveedores/${product.supplierId}`}
            />
          </DataItem>
          <DataItem label="Categoría">{product.category ?? <MissingValue>Sin categoría</MissingValue>}</DataItem>
          <DataItem label="Código de barras">
            {product.barcode !== null ? (
              <span className="font-mono">{product.barcode}</span>
            ) : (
              <MissingValue>Sin código</MissingValue>
            )}
          </DataItem>
          <DataItem label="Stock">
            <span className="tabular-nums">{product.currentStock}</span>
            <span className="text-muted"> unidades · mínimo {product.minimumStock}</span>
          </DataItem>
        </dl>
      </Panel>

      {adminPanel}
    </article>
  );
}
