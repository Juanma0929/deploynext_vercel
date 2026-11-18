"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import type { TodaySales } from "../application/list-today-sales.use-case";
import { salesContainer } from "../di/container";

export type TodaySalesState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: TodaySales }
  | { readonly status: "error"; readonly message: string };

/** The facade of the sales of the day: it loads them on mount and can reload. */
export function useTodaySales(): TodaySalesState & { readonly reload: () => void } {
  const [state, setState] = useState<TodaySalesState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    salesContainer()
      .listTodaySales.execute()
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
