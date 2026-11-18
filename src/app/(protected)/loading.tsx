import { SegmentLoading } from "@/shared/presentation/ui";

/** Shown while the server renders this segment. */
export default function ProtectedLoading() {
  return <SegmentLoading label="Cargando…" />;
}
