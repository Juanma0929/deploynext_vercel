"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { onSessionReset } from "@/shared/presentation/session-reset";

import { suppliersContainer } from "../di/container";
import type { Supplier } from "../domain/supplier";

export type SuppliersListState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly suppliers: readonly Supplier[] }
  | { readonly status: "error"; readonly message: string };

export interface SuppliersContextValue {
  readonly list: SuppliersListState;
  readonly reload: () => void;
}

export const SuppliersContext = createContext<SuppliersContextValue | null>(null);

/** The store of suppliers: the list, loaded once when the screen opens. */
export function SuppliersProvider({ children }: { readonly children: ReactNode }) {
  const [list, setList] = useState<SuppliersListState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    suppliersContainer()
      .listSuppliers.execute()
      .then((suppliers) => {
        if (isCurrent) setList({ status: "ready", suppliers });
      })
      .catch((error: unknown) => {
        if (isCurrent) setList({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  useEffect(() => onSessionReset(() => setList({ status: "loading" })), []);

  const reload = useCallback(() => {
    setList({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo<SuppliersContextValue>(() => ({ list, reload }), [list, reload]);

  return <SuppliersContext.Provider value={value}>{children}</SuppliersContext.Provider>;
}
