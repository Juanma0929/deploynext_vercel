import { SegmentLoading } from "@/shared/presentation/ui";

/** Shown while the server renders this segment. */
export default function SalesLoading() {
  return <SegmentLoading label="Cargando las ventas…" />;
}
