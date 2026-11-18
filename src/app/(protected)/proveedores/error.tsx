"use client";

import { SegmentError } from "@/shared/presentation/ui";

interface SuppliersErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/** What this segment shows when it fails to render; retry() fetches and renders it again. */
export default function SuppliersError({ retry }: SuppliersErrorProps) {
  return <SegmentError title="No se pudieron cargar los proveedores" retry={retry} />;
}
