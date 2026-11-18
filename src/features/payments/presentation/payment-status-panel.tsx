"use client";

import { useRouter } from "next/navigation";

import { Alert, Button, ButtonLink, Spinner } from "@/shared/presentation/ui";

import type { SalePaymentStatus } from "../domain/payment-status";
import { usePaymentStatus } from "./use-payment";

/** The new sale screen, filled with the products of a declined sale. */
const NEW_SALE_FROM = (saleId: string) => `/ventas/nueva?desde=${encodeURIComponent(saleId)}`;

interface PaymentStatusPanelProps {
  readonly saleId: string;
  /** The status the page knows. Pending starts the polling; a final one is just shown. */
  readonly initialStatus: SalePaymentStatus;
  /**
   * Refresh the page when the payment settles, so a detail rendered on the
   * server shows the new status. Off where the page would no longer render
   * this panel after a refresh.
   */
  readonly refreshOnSettle?: boolean;
}

/** How the payment of a sale is going, updated live while it is pending. */
export function PaymentStatusPanel({ saleId, initialStatus, refreshOnSettle = false }: PaymentStatusPanelProps) {
  const router = useRouter();
  const { state, retry } = usePaymentStatus(
    saleId,
    initialStatus,
    refreshOnSettle ? { onSettled: () => router.refresh() } : {},
  );

  const retryButton = (label: string) => (
    <Button variant="secondary" size="sm" onClick={retry} className="mt-1 self-start">
      {label}
    </Button>
  );

  switch (state.phase) {
    case "checking":
      return (
        <Alert tone="info" role="status" className="max-w-lg">
          <div className="flex items-center gap-3">
            <Spinner size="sm" />
            <div>
              <p className="font-medium">Esperando la respuesta del pago…</p>
              <p className="text-xs">
                Verificamos con Wompi cada pocos segundos. Con Nequi, el cliente debe aceptar en su app.
              </p>
            </div>
          </div>
        </Alert>
      );

    case "paid":
      return (
        <Alert tone="success" className="max-w-lg">
          <p className="font-medium">Pago aprobado.</p>
          <p>La venta quedó pagada.</p>
        </Alert>
      );

    case "declined":
      return (
        <Alert tone="danger" className="max-w-lg">
          <p className="font-medium">El pago fue rechazado.</p>
          <p>
            La venta quedó rechazada y el stock de sus productos volvió al inventario. Una venta se cobra
            una sola vez: para intentarlo de nuevo, registra una venta nueva.
          </p>
          <ButtonLink href={NEW_SALE_FROM(saleId)} size="sm" className="mt-1 self-start">
            Crear nueva venta con los mismos productos
          </ButtonLink>
        </Alert>
      );

    case "cancelled":
      return (
        <Alert tone="neutral" className="max-w-lg">
          <p className="font-medium">La venta fue cancelada.</p>
        </Alert>
      );

    case "timeout":
      return (
        <Alert tone="warning" role="status" className="max-w-lg">
          <p className="font-medium">El pago sigue pendiente.</p>
          <p>Wompi todavía no tiene una respuesta. Si el cliente ya aceptó o rechazó, verifica de nuevo.</p>
          {retryButton("Verificar de nuevo")}
        </Alert>
      );

    case "gateway-error":
      return (
        <Alert tone="warning" className="max-w-lg">
          <p className="font-medium">{state.message}</p>
          {retryButton("Reintentar")}
        </Alert>
      );

    case "no-payment":
      return (
        <Alert tone="neutral" className="max-w-lg">
          <p>{state.message}</p>
        </Alert>
      );

    case "error":
      return (
        <Alert tone="danger" className="max-w-lg">
          <p>{state.message}</p>
          {retryButton("Verificar de nuevo")}
        </Alert>
      );
  }
}
