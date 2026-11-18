"use client";

import Link from "next/link";

import {
  Alert,
  Badge,
  Button,
  LoadingText,
  RetryAlert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  cn,
} from "@/shared/presentation/ui";

import { isOutOfStock, unitsToMinimum } from "../domain/reports";
import { ReportSection } from "./report-section";
import { useReports } from "./use-reports";

/**
 * The active products at or below their minimum, most urgent first, with the
 * supplier that the API sends with each row. The status says it in words as
 * well as in color.
 */
export function LowStockReport() {
  const { lowStock } = useReports({ lowStock: true });

  return (
    <ReportSection
      titleId="low-stock-report-title"
      title="Stock bajo"
      description="Productos activos con el stock en su mínimo o por debajo, los más urgentes primero."
      actions={
        <Button variant="secondary" onClick={lowStock.reload} disabled={lowStock.status === "loading"}>
          Actualizar
        </Button>
      }
    >
      {lowStock.status === "loading" && <LoadingText>Cargando el reporte…</LoadingText>}

      {lowStock.status === "error" && <RetryAlert message={lowStock.message} onRetry={lowStock.reload} />}

      {lowStock.status === "ready" &&
        (lowStock.data.products.length === 0 ? (
          <Alert tone="success" className="justify-center text-center">
            <p>✓ Ningún producto está en su stock mínimo. No hay nada por reponer.</p>
          </Alert>
        ) : (
          <>
            <p className="text-sm">
              <strong className="tabular-nums">{lowStock.data.products.length}</strong>{" "}
              {lowStock.data.products.length === 1 ? "producto por reponer" : "productos por reponer"}
              {lowStock.data.outOfStockCount > 0 && (
                <>
                  , <strong className="text-red-700 tabular-nums">{lowStock.data.outOfStockCount}</strong>{" "}
                  {lowStock.data.outOfStockCount === 1 ? "agotado" : "agotados"}
                </>
              )}
              .
            </p>
            <Table caption="Productos con stock bajo">
              <TableHead>
                <TableHeaderCell>Producto</TableHeaderCell>
                <TableHeaderCell>Proveedor</TableHeaderCell>
                <TableHeaderCell align="right">Stock actual</TableHeaderCell>
                <TableHeaderCell align="right">Mínimo</TableHeaderCell>
                <TableHeaderCell align="right">Faltan para el mínimo</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
              </TableHead>
              <TableBody>
                {lowStock.data.products.map((product) => {
                  const outOfStock = isOutOfStock(product);
                  return (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        <Link href={`/productos/${product.productId}`} className="text-primary hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/proveedores/${product.supplierId}`} className="hover:underline">
                          {product.supplierName}
                        </Link>
                      </TableCell>
                      <TableCell align="right" className={cn("tabular-nums", outOfStock && "font-semibold text-red-700")}>
                        {product.currentStock}
                      </TableCell>
                      <TableCell align="right" className="text-muted tabular-nums">
                        {product.minimumStock}
                      </TableCell>
                      <TableCell align="right" className="tabular-nums">
                        {unitsToMinimum(product)}
                      </TableCell>
                      <TableCell>
                        {/* Agotado is worse than stock bajo: red, and a different shape. */}
                        {outOfStock ? (
                          <Badge tone="danger" className="gap-1">
                            <span aria-hidden="true">●</span> Agotado
                          </Badge>
                        ) : (
                          <Badge tone="warning" className="gap-1">
                            <span aria-hidden="true">▲</span> Stock bajo
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        ))}
    </ReportSection>
  );
}
