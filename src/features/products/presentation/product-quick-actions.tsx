"use client";

import { useId, useState, type FormEvent } from "react";

import { Alert, Button, Panel, TextInput, describedBy, errorId, useToast } from "@/shared/presentation/ui";

import type { ProductProps } from "../domain/product";
import { useProductQuickActions } from "./use-product-quick-actions";

interface ProductQuickActionsProps {
  /** The product as plain data, from the page rendered on the server. */
  readonly product: ProductProps;
}

/**
 * The two changes an admin makes most often without opening the form: setting
 * the stock after counting the shelf, and activating or deactivating the
 * product. Each one sends a single field, and confirms with a toast.
 */
export function ProductQuickActions({ product }: ProductQuickActionsProps) {
  const actions = useProductQuickActions(product);
  const { toast } = useToast();
  const stockId = useId();
  const [stock, setStock] = useState(String(product.currentStock));

  async function handleStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await actions.adjustStock(stock)) toast({ tone: "success", message: "Stock guardado." });
  }

  async function handleToggle() {
    const wasActive = product.isActive;
    if (await actions.toggleActive()) {
      toast({ tone: "success", message: wasActive ? "Producto desactivado." : "Producto activado." });
    }
  }

  return (
    <Panel title="Ajustes rápidos" titleId="quick-actions-title" className="gap-4">
      {actions.error !== null && (
        <Alert tone="danger">
          <p>{actions.error}</p>
        </Alert>
      )}

      <form noValidate onSubmit={handleStock} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={stockId} className="text-sm font-medium">
            Stock actual
          </label>
          <TextInput
            id={stockId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            invalid={actions.stockIssue !== null}
            aria-describedby={describedBy(stockId, { error: actions.stockIssue })}
            className="w-32 tabular-nums"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={actions.isWorking}>
          Guardar stock
        </Button>
        {actions.stockIssue !== null && (
          <p id={errorId(stockId)} className="w-full text-xs text-red-600">
            {actions.stockIssue}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm">
          {product.isActive
            ? "El producto está activo: se puede vender."
            : "El producto está inactivo: sigue en el inventario, pero no se puede vender."}
        </p>
        <Button
          role="switch"
          aria-checked={product.isActive}
          variant={product.isActive ? "danger-outline" : "primary"}
          onClick={() => void handleToggle()}
          disabled={actions.isWorking}
        >
          {product.isActive ? "Desactivar" : "Activar"}
        </Button>
      </div>
    </Panel>
  );
}
