"use client";

import { SegmentError } from "@/shared/presentation/ui";

interface ProductsErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/** Shown when the inventory could not be loaded; retry() fetches and renders it again. */
export default function ProductsError({ retry }: ProductsErrorProps) {
  return <SegmentError title="No se pudo cargar el inventario" retry={retry} />;
}
