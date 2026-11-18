"use client";

import { SegmentError } from "@/shared/presentation/ui";

interface SalesErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/** What this segment shows when it fails to render; retry() fetches and renders it again. */
export default function SalesError({ retry }: SalesErrorProps) {
  return <SegmentError title="No se pudieron cargar las ventas" retry={retry} />;
}
