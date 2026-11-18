"use client";

import type { ReactNode } from "react";

import { Button, Spinner } from "@/shared/presentation/ui";

import { useServerWakeUp } from "./use-server-wake-up";

interface ServerWakeUpProps {
  /** What to show once the API answered, such as the login form. */
  readonly children: ReactNode;
}

/**
 * Holds the login screen until the API is awake, so the user does not submit
 * the form against a backend that is still starting on Render.
 */
export function ServerWakeUp({ children }: ServerWakeUpProps) {
  const { status, retry } = useServerWakeUp();

  if (status.kind === "ready") return <>{children}</>;

  if (status.kind === "unreachable") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm">{status.message}</p>
        <Button onClick={retry}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 text-center">
      <Spinner />
      <p className="text-sm font-medium">Conectando con el servidor…</p>
      <p className="text-muted text-xs">La primera conexión puede tardar hasta un minuto.</p>
    </div>
  );
}
