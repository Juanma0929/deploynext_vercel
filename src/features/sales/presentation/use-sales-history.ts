"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import type { SalesHistory } from "../application/list-sales-history.use-case";
import { salesContainer } from "../di/container";

export type SalesHistoryState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: SalesHistory }
  | { readonly status: "error"; readonly message: string };

/** The facade of the history: every sale and the sellers, loaded on mount. */
export function useSalesHistory(): SalesHistoryState & { readonly reload: () => void } {
  const [state, setState] = useState<SalesHistoryState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    salesContainer()
      .listSalesHistory.execute()
      .then((data) => {
        if (isCurrent) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (isCurrent) setState({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, reload };
}
