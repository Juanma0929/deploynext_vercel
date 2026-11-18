"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import type { AdminDashboard } from "../application/get-admin-dashboard.use-case";
import { reportsContainer } from "../di/container";

export type AdminDashboardState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: AdminDashboard }
  | { readonly status: "error"; readonly message: string };

/** The facade of the admin dashboard: it loads the reports on mount and can reload. */
export function useAdminDashboard(): AdminDashboardState & { readonly reload: () => void } {
  const [state, setState] = useState<AdminDashboardState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    reportsContainer()
      .getAdminDashboard.execute(new Date())
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
