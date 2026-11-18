"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Dialog } from "@/shared/presentation/dialog";

import { salesContainer } from "../di/container";

interface SaleActionsProps {
  readonly saleId: string;
  /** Pending and with no payment started: it can be charged or cancelled. */
  readonly isAwaitingPayment: boolean;
  /** Admin only (sales:cancel); the route reads it from the permission matrix. */
  readonly canCancel: boolean;
}

/**
 * The actions of a sale. "Cobrar" only while it is pending without a payment;
 * "Cancelar" in the same state, and only for an admin.
 */
export function SaleActions({ saleId, isAwaitingPayment, canCancel }: SaleActionsProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAwaitingPayment) return null;

  async function cancel() {
    setIsCancelling(true);
    setError(null);
    try {
      await salesContainer().cancelSale.execute({ id: saleId, isAwaitingPayment });
      setIsConfirming(false);
      // The detail is rendered on the server: refresh() brings the new status.
      router.refresh();
    } catch (cancelError: unknown) {
      setError(errorMessage(cancelError));
    }
    setIsCancelling(false);
  }

  return (
    <div className="flex gap-2">
      {canCancel && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsConfirming(true);
          }}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Cancelar venta
        </button>
      )}
      <Link
        href={`/ventas/${saleId}/cobrar`}
        className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        Cobrar
      </Link>

      <Dialog open={isConfirming} title="¿Cancelar esta venta?" onClose={() => setIsConfirming(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <p>
            La venta quedará <strong>cancelada</strong> y el stock de sus productos se devolverá al
            inventario. Esta acción no se puede deshacer.
          </p>
          {error !== null && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-red-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={() => void cancel()}
              disabled={isCancelling}
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isCancelling ? "Cancelando…" : "Cancelar venta"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
