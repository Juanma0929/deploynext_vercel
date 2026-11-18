import type { ReactNode } from "react";

import {
  Badge,
  Breadcrumbs,
  EmptyState,
  MissingValue,
  MoneyText,
  Panel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/presentation/ui";

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
      <Breadcrumbs items={[{ label: "Proveedores", href: "/proveedores" }, { label: supplier.name }]} />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="supplier-title" className="text-2xl font-semibold">
          {supplier.name}
        </h1>
        {actions}
      </header>

      <Panel title="Datos de contacto" titleId="supplier-contact-title">
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
      </Panel>

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
            {lowStockCount > 0 && <span className="text-red-700"> · {lowStockCount} con stock bajo</span>}
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState>Este proveedor todavía no tiene productos asociados.</EmptyState>
        ) : (
          <Table caption={`Productos de ${supplier.name}`}>
            <TableHead>
              <TableHeaderCell>Producto</TableHeaderCell>
              <TableHeaderCell>Categoría</TableHeaderCell>
              <TableHeaderCell align="right">Precio de venta</TableHeaderCell>
              <TableHeaderCell align="right">Stock</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className={product.isActive ? undefined : "text-muted"}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category ?? <MissingValue />}</TableCell>
                  <TableCell align="right">
                    <MoneyText value={product.salePrice} />
                  </TableCell>
                  <TableCell align="right" className="whitespace-nowrap tabular-nums">
                    {product.currentStock}
                    <span className="text-muted text-xs"> / mín. {product.minimumStock}</span>
                  </TableCell>
                  <TableCell>
                    {!product.isActive ? (
                      <Badge tone="neutral">Inactivo</Badge>
                    ) : product.isLowStock ? (
                      <Badge tone="danger">Stock bajo</Badge>
                    ) : (
                      <Badge tone="success">Disponible</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </article>
  );
}

/** A contact field; an empty one reads "—". */
function Item({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  const isEmpty = children === null || children === false || children === undefined;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd>{isEmpty ? <MissingValue /> : children}</dd>
    </div>
  );
}
