import Link from "next/link";

import {
  MissingValue,
  MoneyText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/presentation/ui";

import type { InventoryRow } from "../application/list-inventory.use-case";
import { LowStockBadge, ProductStatusBadge } from "./product-badges";

/** The products of one page of the inventory. */
export function InventoryTable({ rows }: { readonly rows: readonly InventoryRow[] }) {
  return (
    <Table caption="Inventario de productos">
      <TableHead>
        <TableHeaderCell>Producto</TableHeaderCell>
        <TableHeaderCell>Categoría</TableHeaderCell>
        <TableHeaderCell>Proveedor</TableHeaderCell>
        <TableHeaderCell align="right">Precio</TableHeaderCell>
        <TableHeaderCell align="right">Stock</TableHeaderCell>
        <TableHeaderCell>Estado</TableHeaderCell>
      </TableHead>
      <TableBody>
        {rows.map(({ product, supplierName }) => (
          <TableRow key={product.id} className={product.isActive ? undefined : "bg-slate-50"}>
            <TableCell>
              <Link href={`/productos/${product.id}`} className="text-primary font-medium hover:underline">
                {product.name}
              </Link>
              {product.barcode !== null && (
                <span className="text-muted block font-mono text-xs">{product.barcode}</span>
              )}
            </TableCell>
            <TableCell>{product.category ?? <MissingValue />}</TableCell>
            <TableCell>{supplierName ?? <MissingValue />}</TableCell>
            <TableCell align="right" className="whitespace-nowrap">
              <MoneyText value={product.salePrice} />
            </TableCell>
            <TableCell align="right" className="whitespace-nowrap">
              <span className="tabular-nums">{product.currentStock}</span>
              <span className="text-muted text-xs"> / mín. {product.minimumStock}</span>
              {product.isLowStock && (
                <span className="ml-2">
                  <LowStockBadge />
                </span>
              )}
            </TableCell>
            <TableCell>
              <ProductStatusBadge isActive={product.isActive} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
