"use client";

import { useCallback, useEffect, useState } from "react";

import type { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";

import { reportsContainer } from "../di/container";
import type { SalesReport } from "../domain/reports";

export type SalesReportState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly report: SalesReport }
  | { readonly status: "error"; readonly message: string };

/** The facade of the sales of a period: loads them for `range` and again when it changes. */
export function useSalesReport(range: DateRange): SalesReportState & { readonly reload: () => void } {
  const [state, setState] = useState<SalesReportState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const key = `${range.from}/${range.to}/${attempt}`;
  const [requested, setRequested] = useState(key);

  // A new range or a retry starts over from "loading" (set while rendering, not in the effect).
  if (requested !== key) {
    setRequested(key);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let isCurrent = true;

    reportsContainer()
      .getSalesReport.execute(range)
      .then((report) => {
        if (isCurrent) setState({ status: "ready", report });
      })
      .catch((error: unknown) => {
        if (isCurrent) setState({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [range, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, reload };
}
