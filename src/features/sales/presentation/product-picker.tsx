"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";

import { normalizeForSearch } from "@/shared/domain/text";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  LoadingText,
  MoneyText,
  RetryAlert,
  TextInput,
  describedBy,
} from "@/shared/presentation/ui";

import type { SaleProduct } from "../domain/sale-product";
import { useSales } from "./use-sales";

/** How many matches the picker lists at once; the search narrows the rest. */
const VISIBLE_LIMIT = 30;

/**
 * The products that can be sold (active, with stock). Searching by name,
 * category or barcode; Enter adds the product when only one matches, or the
 * one whose barcode is exactly what was typed, as a scanner does.
 */
export function ProductPicker() {
  const { products, draft, add, reloadProducts } = useSales().cart;
  const searchId = useId();
  const [term, setTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const all = products.status === "ready" ? products.products : null;
  const matches = useMemo(() => (all === null ? [] : search(all, term)), [all, term]);

  function addProduct(product: SaleProduct) {
    setError(add(product));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const code = term.trim();
    const byBarcode = matches.find((product) => product.barcode !== null && product.barcode === code);
    const target = byBarcode ?? (matches.length === 1 ? matches[0] : undefined);
    if (target === undefined) return;

    addProduct(target);
    setTerm("");
  }

  return (
    <section aria-labelledby="picker-title" className="flex flex-col gap-3">
      <h2 id="picker-title" className="text-lg font-semibold">
        Productos
      </h2>

      <Field id={searchId} label="Buscar producto" hint="Solo se muestran productos activos con stock.">
        <TextInput
          id={searchId}
          type="search"
          placeholder="Nombre, categoría o código de barras"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-describedby={describedBy(searchId, { hint: true })}
        />
      </Field>

      {error !== null && (
        <Alert tone="danger">
          <p>{error}</p>
        </Alert>
      )}

      {products.status === "loading" && <LoadingText>Cargando productos…</LoadingText>}

      {products.status === "error" && <RetryAlert message={products.message} onRetry={reloadProducts} />}

      {all !== null &&
        (matches.length === 0 ? (
          <EmptyState>
            {all.length === 0 ? "No hay productos disponibles para la venta." : "Ningún producto coincide con la búsqueda."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {matches.slice(0, VISIBLE_LIMIT).map((product) => {
              const remaining = draft.remainingFor(product);
              const inCart = draft.quantityOf(product.id);
              return (
                <li key={product.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-muted text-xs">
                      <MoneyText value={product.salePrice} /> · {remaining} disponibles
                      {inCart > 0 && ` · ${inCart} en la venta`}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addProduct(product)}
                    disabled={remaining === 0}
                    aria-label={`Agregar ${product.name}`}
                    className="text-primary border-primary/40"
                  >
                    {remaining === 0 ? "Sin más stock" : "Agregar"}
                  </Button>
                </li>
              );
            })}
          </ul>
        ))}

      {matches.length > VISIBLE_LIMIT && (
        <p className="text-muted text-xs">
          Se muestran {VISIBLE_LIMIT} de {matches.length}. Escribe más para afinar la búsqueda.
        </p>
      )}
    </section>
  );
}

function search(products: readonly SaleProduct[], term: string): SaleProduct[] {
  const needle = normalizeForSearch(term);
  if (needle === "") return [...products];
  return products.filter((product) =>
    normalizeForSearch([product.name, product.category, product.barcode].join(" ")).includes(needle),
  );
}
