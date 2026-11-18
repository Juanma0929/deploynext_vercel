"use client";

import { useId, useState, type FormEvent } from "react";

import type { ProductProps } from "../domain/product";
import { useProductQuickActions } from "./use-product-quick-actions";

interface ProductQuickActionsProps {
  /** The product as plain data, from the page rendered on the server. */
  readonly product: ProductProps;
}

/**
 * The two changes an admin makes most often without opening the form: setting
 * the stock after counting the shelf, and activating or deactivating the
 * product. Each one sends a single field.
 */
export function ProductQuickActions({ product }: ProductQuickActionsProps) {
  const actions = useProductQuickActions(product);
  const stockId = useId();
  const [stock, setStock] = useState(String(product.currentStock));
  const [saved, setSaved] = useState(false);

  async function handleStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setSaved(await actions.adjustStock(stock));
  }

  return (
    <section
      aria-labelledby="quick-actions-title"
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 id="quick-actions-title" className="font-semibold">
        Ajustes rápidos
      </h2>

      {actions.error !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {actions.error}
        </p>
      )}

      <form noValidate onSubmit={handleStock} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={stockId} className="text-sm font-medium">
            Stock actual
          </label>
          <input
            id={stockId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={stock}
            onChange={(event) => {
              setStock(event.target.value);
              setSaved(false);
            }}
            aria-invalid={actions.stockIssue !== null}
            aria-describedby={actions.stockIssue !== null ? `${stockId}-error` : undefined}
            className="focus:border-primary focus:ring-primary/20 w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:ring-2 aria-[invalid=true]:border-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={actions.isWorking}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60"
        >
          Guardar stock
        </button>
        {saved && (
          <p role="status" className="py-2 text-sm text-emerald-700">
            Stock guardado.
          </p>
        )}
        {actions.stockIssue !== null && (
          <p id={`${stockId}-error`} className="w-full text-xs text-red-600">
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
        <button
          type="button"
          role="switch"
          aria-checked={product.isActive}
          onClick={() => void actions.toggleActive()}
          disabled={actions.isWorking}
          className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60 ${
            product.isActive
              ? "border border-red-300 text-red-700 hover:bg-red-50"
              : "bg-primary text-white"
          }`}
        >
          {product.isActive ? "Desactivar" : "Activar"}
        </button>
      </div>
    </section>
  );
}
