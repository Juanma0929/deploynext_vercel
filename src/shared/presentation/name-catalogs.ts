"use client";

import { useEffect, useMemo } from "react";

import { createStore, useStore, type ResourceState, type Store } from "./store";

/**
 * The cached catalogs that other features read names from: "the name of the
 * product with this id", "the name of this supplier". Features do not import
 * each other, so products and suppliers publish their catalog here and the
 * app registers them (src/app/(protected)/name-catalogs.tsx); a sale only
 * asks for a name by id.
 */
export type NameCatalogKind = "products" | "suppliers";

interface Named {
  readonly id: string;
  readonly name: string;
}

/** What a catalog has to offer: its state, read only, and how to load it if missing. */
export interface NameCatalogSource {
  readonly store: Pick<Store<ResourceState<readonly Named[]>>, "get" | "subscribe">;
  ensure(): Promise<void>;
}

const sources = new Map<NameCatalogKind, NameCatalogSource>();

export function registerNameCatalog(kind: NameCatalogKind, source: NameCatalogSource): void {
  sources.set(kind, source);
}

export type CatalogNameState =
  /** The catalog is still loading (and always on the server, which has no catalog). */
  | { readonly status: "loading" }
  | { readonly status: "found"; readonly name: string }
  /** The catalog loaded and has no such id (it was deleted), or it failed. */
  | { readonly status: "missing" };

const IDLE = createStore<ResourceState<readonly Named[]>>({ status: "idle" });
const indexes = new WeakMap<readonly Named[], ReadonlyMap<string, string>>();

/** One index per version of the catalog, shared by every row that asks. */
function indexOf(items: readonly Named[]): ReadonlyMap<string, string> {
  let index = indexes.get(items);
  if (index === undefined) {
    index = new Map(items.map((item) => [item.id, item.name]));
    indexes.set(items, index);
  }
  return index;
}

/** The name of `id` in a catalog, loading the catalog once if nobody did yet. */
export function useCatalogName(kind: NameCatalogKind, id: string): CatalogNameState {
  const source = sources.get(kind) ?? null;
  const state = useStore((source ?? { store: IDLE }).store);

  useEffect(() => {
    void source?.ensure();
  }, [source]);

  return useMemo<CatalogNameState>(() => {
    const items =
      state.status === "ready" ? state.data : state.status === "loading" ? state.previous : null;
    if (items !== null) {
      const name = indexOf(items).get(id);
      return name === undefined ? { status: "missing" } : { status: "found", name };
    }
    return state.status === "error" ? { status: "missing" } : { status: "loading" };
  }, [state, id]);
}
