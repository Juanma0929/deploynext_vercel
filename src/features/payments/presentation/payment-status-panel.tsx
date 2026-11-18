"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import type { SalePaymentStatus } from "../domain/payment-status";
import { usePaymentStatus } from "./use-payment-status";

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

  switch (state.phase) {
    case "checking":
      return (
        <Box tone="info" role="status">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="border-primary size-5 shrink-0 animate-spin rounded-full border-2 border-t-transparent"
            />
            <div>
              <p className="font-medium">Esperando la respuesta del pago…</p>
              <p className="text-xs">
                Verificamos con Wompi cada pocos segundos. Con Nequi, el cliente debe aceptar en su app.
              </p>
            </div>
          </div>
        </Box>
      );

    case "paid":
      return (
        <Box tone="success" role="status">
          <p className="font-medium">Pago aprobado.</p>
          <p>La venta quedó pagada.</p>
        </Box>
      );

    case "declined":
      return (
        <Box tone="danger" role="alert">
          <p className="font-medium">El pago fue rechazado.</p>
          <p>
            La venta quedó rechazada y el stock de sus productos volvió al inventario. Una venta se cobra
            una sola vez: para intentarlo de nuevo, registra una venta nueva.
          </p>
          <Link
            href={NEW_SALE_FROM(saleId)}
            className="bg-primary mt-1 self-start rounded-md px-4 py-2 font-medium text-white"
          >
            Crear nueva venta con los mismos productos
          </Link>
        </Box>
      );

    case "cancelled":
      return (
        <Box tone="neutral" role="status">
          <p className="font-medium">La venta fue cancelada.</p>
        </Box>
      );

    case "timeout":
      return (
        <Box tone="warning" role="status">
          <p className="font-medium">El pago sigue pendiente.</p>
          <p>Wompi todavía no tiene una respuesta. Si el cliente ya aceptó o rechazó, verifica de nuevo.</p>
          <RetryButton onClick={retry}>Verificar de nuevo</RetryButton>
        </Box>
      );

    case "gateway-error":
      return (
        <Box tone="warning" role="alert">
          <p className="font-medium">{state.message}</p>
          <RetryButton onClick={retry}>Reintentar</RetryButton>
        </Box>
      );

    case "no-payment":
      return (
        <Box tone="neutral" role="status">
          <p>{state.message}</p>
        </Box>
      );

    case "error":
      return (
        <Box tone="danger" role="alert">
          <p>{state.message}</p>
          <RetryButton onClick={retry}>Verificar de nuevo</RetryButton>
        </Box>
      );
  }
}

const TONES = {
  info: "border-sky-300 bg-sky-50 text-sky-950",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  danger: "border-red-300 bg-red-50 text-red-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  neutral: "border-slate-300 bg-slate-50 text-slate-900",
} as const;

function Box({
  tone,
  role,
  children,
}: {
  readonly tone: keyof typeof TONES;
  readonly role: "status" | "alert";
  readonly children: ReactNode;
}) {
  return (
    <div
      role={role}
      aria-live="polite"
      className={`flex max-w-lg flex-col gap-2 rounded-lg border p-4 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

function RetryButton({ onClick, children }: { readonly onClick: () => void; readonly children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-md border border-current px-4 py-2 font-medium hover:bg-white/50"
    >
      {children}
    </button>
  );
}
