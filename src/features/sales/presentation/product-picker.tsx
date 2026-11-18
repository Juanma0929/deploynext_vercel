"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";

import type { SaleProduct } from "../domain/sale-product";
import { useNewSale } from "./use-new-sale";

/** How many matches the picker lists at once; the search narrows the rest. */
const VISIBLE_LIMIT = 30;

/**
 * The products that can be sold (active, with stock). Searching by name,
 * category or barcode; Enter adds the product when only one matches, or the
 * one whose barcode is exactly what was typed, as a scanner does.
 */
export function ProductPicker() {
  const { products, draft, add, reloadProducts } = useNewSale();
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

      <div className="flex flex-col gap-1">
        <label htmlFor={searchId} className="text-xs font-medium">
          Buscar producto
        </label>
        <input
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
          className="focus:border-primary focus:ring-primary/20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
        />
        <p className="text-muted text-xs">Solo se muestran productos activos con stock.</p>
      </div>

      {error !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {products.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando productos…
        </p>
      )}

      {products.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{products.message}</p>
          <button type="button" onClick={reloadProducts} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {all !== null &&
        (matches.length === 0 ? (
          <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
            {all.length === 0
              ? "No hay productos disponibles para la venta."
              : "Ningún producto coincide con la búsqueda."}
          </p>
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
                      {product.salePrice.format()} · {remaining} disponibles
                      {inCart > 0 && ` · ${inCart} en la venta`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduct(product)}
                    disabled={remaining === 0}
                    aria-label={`Agregar ${product.name}`}
                    className="text-primary border-primary/40 hover:bg-primary/5 rounded-md border px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {remaining === 0 ? "Sin más stock" : "Agregar"}
                  </button>
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
  const needle = normalize(term);
  if (needle === "") return [...products];
  return products.filter((product) =>
    normalize([product.name, product.category, product.barcode].join(" ")).includes(needle),
  );
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}
