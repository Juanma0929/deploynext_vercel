"use client";

import { useCallback, useMemo } from "react";

import { notifyDataChanged } from "@/shared/presentation/data-changes";
import { useResource } from "@/shared/presentation/store";

import { suppliersContainer } from "../di/container";
import type { Supplier } from "../domain/supplier";
import { suppliersCatalog } from "./suppliers-store";

export type SuppliersListState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly suppliers: readonly Supplier[] }
  | { readonly status: "error"; readonly message: string };

export interface SuppliersFacade {
  readonly list: SuppliersListState;
  readonly reload: () => void;
  /** The name of a supplier by id, from the cached catalog; null if it is not there. */
  readonly nameOf: (id: string) => string | null;
  /** Deletes a supplier and marks the catalog stale. Rejects with the errors of the use case. */
  readonly deleteSupplier: (id: string) => Promise<void>;
}

/** The facade of suppliers. Components read and change suppliers only through here. */
export function useSuppliers(): SuppliersFacade {
  const state = useResource(suppliersCatalog, "cached");

  const list = useMemo<SuppliersListState>(() => {
    if (state.status === "ready") return { status: "ready", suppliers: state.data };
    if (state.status === "error") return { status: "error", message: state.message };
    // While it reloads, the previous list stays on screen.
    if (state.status === "loading" && state.previous !== null) return { status: "ready", suppliers: state.previous };
    return { status: "loading" };
  }, [state]);

  const names = useMemo(
    () => new Map((list.status === "ready" ? list.suppliers : []).map((supplier) => [supplier.id, supplier.name])),
    [list],
  );

  const nameOf = useCallback((id: string) => names.get(id) ?? null, [names]);
  const reload = useCallback(() => void suppliersCatalog.reload(), []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      await suppliersContainer().deleteSupplier.execute(id);
    } finally {
      // Even a 404 (someone else deleted it) means the cached list is wrong now.
      notifyDataChanged("suppliers");
    }
  }, []);

  return { list, reload, nameOf, deleteSupplier };
}
