import { SegmentLoading } from "@/shared/presentation/ui";

/** Shown while the server renders this segment. */
export default function SuppliersLoading() {
  return <SegmentLoading label="Cargando los proveedores…" />;
}
