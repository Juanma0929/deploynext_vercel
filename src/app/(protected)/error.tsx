"use client";

import { SegmentError } from "@/shared/presentation/ui";

interface ProtectedErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/** What this segment shows when it fails to render; retry() fetches and renders it again. */
export default function ProtectedError({ retry }: ProtectedErrorProps) {
  return <SegmentError title="No se pudo cargar esta sección" retry={retry} />;
}
