"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { authContainer } from "../di/container";

export type ServerStatus =
  | { readonly kind: "connecting" }
  | { readonly kind: "ready" }
  | { readonly kind: "unreachable"; readonly message: string };

export interface ServerWakeUpState {
  readonly status: ServerStatus;
  readonly retry: () => void;
}

/** The facade of the cold-start check: it pings the API once on mount. */
export function useServerWakeUp(): ServerWakeUpState {
  const [status, setStatus] = useState<ServerStatus>({ kind: "connecting" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    authContainer()
      .wakeUpServer.execute()
      .then(() => {
        if (isCurrent) setStatus({ kind: "ready" });
      })
      .catch((error: unknown) => {
        if (isCurrent) setStatus({ kind: "unreachable", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus({ kind: "connecting" });
    setAttempt((value) => value + 1);
  }, []);

  return { status, retry };
}
