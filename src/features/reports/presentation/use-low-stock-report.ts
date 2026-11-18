"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import type { LowStockReport } from "../application/get-low-stock-report.use-case";
import { reportsContainer } from "../di/container";

export type LowStockReportState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly report: LowStockReport }
  | { readonly status: "error"; readonly message: string };

/** The facade of the low stock report: loads it on mount and can reload. */
export function useLowStockReport(): LowStockReportState & { readonly reload: () => void } {
  const [state, setState] = useState<LowStockReportState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    reportsContainer()
      .getLowStockReport.execute()
      .then((report) => {
        if (isCurrent) setState({ status: "ready", report });
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
