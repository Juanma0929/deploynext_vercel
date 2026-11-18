import { SegmentLoading } from "@/shared/presentation/ui";

/** Shown while the server renders this segment. */
export default function ReportsLoading() {
  return <SegmentLoading label="Cargando los reportes…" />;
}
