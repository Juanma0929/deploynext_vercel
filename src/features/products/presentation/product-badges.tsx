import { Badge } from "@/shared/presentation/ui";

/** Active can be sold; inactive stays in the inventory but cannot. */
export function ProductStatusBadge({ isActive }: { readonly isActive: boolean }) {
  return isActive ? <Badge tone="success">Activo</Badge> : <Badge tone="neutral">Inactivo</Badge>;
}

/** currentStock <= minimumStock: the product has to be restocked. */
export function LowStockBadge() {
  return <Badge tone="danger">Stock bajo</Badge>;
}
