"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

import type { DraftLine } from "../domain/sale-draft";
import { useNewSale } from "./use-new-sale";

/** The cart: quantities, the estimated total and the button that registers the sale. */
export function SaleCart() {
  const router = useRouter();
  const { draft, failure, isSubmitting, submit, dismissFailure } = useNewSale();
  const [invalidLines, setInvalidLines] = useState<ReadonlySet<string>>(new Set());

  const markValidity = useCallback((productId: string, isValid: boolean) => {
    setInvalidLines((current) => {
      if (isValid === !current.has(productId)) return current;
      const next = new Set(current);
      if (isValid) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  async function handleSubmit() {
    const result = await submit();
    if (result.ok) router.push(`/ventas/${result.saleId}`);
  }

  // Only lines still in the cart count: one removed by a refresh cannot block it.
  const hasInvalidLine = draft.lines.some((line) => invalidLines.has(line.product.id));
  const canSubmit = !draft.isEmpty && !hasInvalidLine && !isSubmitting;

  return (
    <section
      aria-labelledby="cart-title"
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-4"
    >
      <h2 id="cart-title" className="text-lg font-semibold">
        Venta
      </h2>

      {failure !== null && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          <p className="font-medium">No se pudo registrar la venta.</p>
          <p>{failure.message}</p>
          {failure.adjustments.length > 0 && (
            <>
              <p className="mt-2">Actualizamos los productos y ajustamos la venta:</p>
              <ul className="list-disc pl-5">
                {failure.adjustments.map((adjustment) => (
                  <li key={adjustment.productName}>
                    {adjustment.kind === "removed"
                      ? `${adjustment.productName}: se quitó, ya no está disponible.`
                      : `${adjustment.productName}: la cantidad bajó a ${adjustment.quantity ?? 0}.`}
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" onClick={dismissFailure} className="mt-2 font-medium underline">
            Entendido
          </button>
        </div>
      )}

      {draft.isEmpty ? (
        <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
          Agrega productos desde la lista para armar la venta.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {draft.lines.map((line) => (
            <CartLine key={line.product.id} line={line} onValidityChange={markValidity} />
          ))}
        </ul>
      )}

      <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
        <div>
          <p className="text-sm font-medium">Total estimado</p>
          <p className="text-muted text-xs">
            {draft.unitCount} {draft.unitCount === 1 ? "unidad" : "unidades"}. El total final lo
            calcula el servidor con los precios vigentes.
          </p>
        </div>
        <p className="text-xl font-semibold tabular-nums">{draft.estimatedTotal.format()}</p>
      </div>

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        className="bg-primary rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Registrando venta…" : "Registrar venta"}
      </button>
    </section>
  );
}

interface CartLineProps {
  readonly line: DraftLine;
  readonly onValidityChange: (productId: string, isValid: boolean) => void;
}

/**
 * One product of the cart. The quantity is typed freely; it only reaches the
 * cart when the domain accepts it, and otherwise the line shows why.
 */
function CartLine({ line, onValidityChange }: CartLineProps) {
  const { setQuantity, remove } = useNewSale();
  const quantityId = useId();
  const { product } = line;
  const [text, setText] = useState(String(line.quantity));
  const [error, setError] = useState<string | null>(null);

  // The cart may change the quantity by itself (adding again, a refresh after a 409).
  const [lastQuantity, setLastQuantity] = useState(line.quantity);
  if (lastQuantity !== line.quantity) {
    setLastQuantity(line.quantity);
    setText(String(line.quantity));
    setError(null);
  }

  // The cart learns whether this line blocks the sale; a line that leaves the cart stops blocking it.
  useEffect(() => {
    onValidityChange(product.id, error === null);
    return () => onValidityChange(product.id, true);
  }, [error, product.id, onValidityChange]);

  function commit(raw: string) {
    setText(raw);
    const quantity = raw.trim() === "" ? Number.NaN : Number(raw);
    setError(setQuantity(product.id, quantity));
  }

  function step(delta: number) {
    commit(String(line.quantity + delta));
  }


  return (
    <li className="flex flex-col gap-2 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{product.name}</p>
          <p className="text-muted text-xs">
            {product.salePrice.format()} c/u · stock {product.currentStock}
          </p>
        </div>
        <p className="tabular-nums">{line.estimatedSubtotal.format()}</p>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={quantityId} className="sr-only">
          Cantidad de {product.name}
        </label>
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={line.quantity <= 1}
          aria-label={`Quitar una unidad de ${product.name}`}
          className="size-8 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
        >
          −
        </button>
        <input
          id={quantityId}
          type="number"
          inputMode="numeric"
          min={1}
          max={product.currentStock}
          step={1}
          value={text}
          onChange={(event) => commit(event.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error !== null ? `${quantityId}-error` : undefined}
          className="focus:border-primary w-16 rounded-md border border-slate-300 px-2 py-1 text-center tabular-nums outline-none aria-[invalid=true]:border-red-500"
        />
        <button
          type="button"
          onClick={() => step(1)}
          disabled={line.quantity >= product.currentStock}
          aria-label={`Agregar una unidad de ${product.name}`}
          className="size-8 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => remove(product.id)}
          className="ml-auto text-xs font-medium text-red-600 hover:underline"
        >
          Quitar
        </button>
      </div>

      {error !== null && (
        <p id={`${quantityId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}
