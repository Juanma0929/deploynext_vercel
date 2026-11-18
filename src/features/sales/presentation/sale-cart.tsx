"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

import { Alert, Button, EmptyState, MoneyText, TextInput, describedBy, errorId } from "@/shared/presentation/ui";

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
        <Alert tone="danger">
          <p className="font-medium">No se pudo registrar la venta.</p>
          <p>{failure.message}</p>
          {failure.adjustments.length > 0 && (
            <>
              <p className="mt-1">Actualizamos los productos y ajustamos la venta:</p>
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
          <Button variant="link" onClick={dismissFailure} className="mt-1 self-start">
            Entendido
          </Button>
        </Alert>
      )}

      {draft.isEmpty ? (
        <EmptyState>Agrega productos desde la lista para armar la venta.</EmptyState>
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
        <MoneyText value={draft.estimatedTotal} className="text-xl font-semibold" />
      </div>

      <Button
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        isLoading={isSubmitting}
        loadingText="Registrando venta…"
        className="py-2.5"
      >
        Registrar venta
      </Button>
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
            <MoneyText value={product.salePrice} /> c/u · stock {product.currentStock}
          </p>
        </div>
        <MoneyText value={line.estimatedSubtotal} />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={quantityId} className="sr-only">
          Cantidad de {product.name}
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => step(-1)}
          disabled={line.quantity <= 1}
          aria-label={`Quitar una unidad de ${product.name}`}
          className="size-8 p-0"
        >
          −
        </Button>
        <TextInput
          id={quantityId}
          type="number"
          inputMode="numeric"
          min={1}
          max={product.currentStock}
          step={1}
          value={text}
          onChange={(event) => commit(event.target.value)}
          invalid={error !== null}
          aria-describedby={describedBy(quantityId, { error })}
          className="w-16 px-2 py-1 text-center tabular-nums"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => step(1)}
          disabled={line.quantity >= product.currentStock}
          aria-label={`Agregar una unidad de ${product.name}`}
          className="size-8 p-0"
        >
          +
        </Button>
        <Button variant="link" onClick={() => remove(product.id)} className="ml-auto text-xs text-red-600">
          Quitar
        </Button>
      </div>

      {error !== null && (
        <p id={errorId(quantityId)} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}
