"use client";

import { SegmentError } from "@/shared/presentation/ui";

interface ReportsErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/** What this segment shows when it fails to render; retry() fetches and renders it again. */
export default function ReportsError({ retry }: ReportsErrorProps) {
  return <SegmentError title="No se pudieron cargar los reportes" retry={retry} />;
}
