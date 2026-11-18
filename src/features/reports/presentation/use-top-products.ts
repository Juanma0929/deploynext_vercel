"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { reportsContainer } from "../di/container";
import type { TopProduct } from "../domain/reports";

export type TopProductsState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly products: readonly TopProduct[] }
  | { readonly status: "error"; readonly message: string };

/** The facade of the best sellers: loads them for `limit` and again when it changes. */
export function useTopProducts(limit: number): TopProductsState & { readonly reload: () => void } {
  const [state, setState] = useState<TopProductsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [requested, setRequested] = useState({ limit, attempt });

  // A new limit or a retry starts over from "loading" (set while rendering, not in the effect).
  if (requested.limit !== limit || requested.attempt !== attempt) {
    setRequested({ limit, attempt });
    setState({ status: "loading" });
  }

  useEffect(() => {
    let isCurrent = true;

    reportsContainer()
      .getTopProducts.execute(limit)
      .then((products) => {
        if (isCurrent) setState({ status: "ready", products });
      })
      .catch((error: unknown) => {
        if (isCurrent) setState({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [limit, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, reload };
}
