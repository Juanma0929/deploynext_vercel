"use client";

import { usePermissions } from "@/features/auth/presentation";
import { SaleActions } from "@/features/sales/presentation";

interface SaleActionsRouteProps {
  readonly saleId: string;
  readonly isAwaitingPayment: boolean;
}

/** Asks the permission matrix of auth whether "Cancelar" shows, so sales does not import auth. */
export function SaleActionsRoute({ saleId, isAwaitingPayment }: SaleActionsRouteProps) {
  const { can } = usePermissions();
  return (
    <SaleActions saleId={saleId} isAwaitingPayment={isAwaitingPayment} canCancel={can("sales:cancel")} />
  );
}
