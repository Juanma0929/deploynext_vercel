"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Dialog } from "@/shared/presentation/dialog";

import { salesContainer } from "../di/container";
import { SaleNotCancellableError } from "../domain/errors";

interface SaleActionsProps {
  readonly saleId: string;
  /** Pending and with no payment started: it can be charged or cancelled. */
  readonly isAwaitingPayment: boolean;
  /** Admin only (sales:cancel); the route reads it from the permission matrix. */
  readonly canCancel: boolean;
}

/** How the last cancellation ended. */
type Outcome =
  | { readonly kind: "cancelled" }
  /** 409: the sale changed under us (charged, paying, cancelled); the detail was refreshed. */
  | { readonly kind: "conflict"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

/**
 * The actions of a sale. "Cobrar" only while it is pending without a payment;
 * "Cancelar venta" in the same state, and only for an admin.
 *
 * The detail is rendered on the server, so after cancelling (or a 409) the
 * page is refreshed to show the new status. The state of this component
 * survives router.refresh(), so the dialog and the notice stay on screen even
 * when the refreshed sale no longer offers the buttons.
 */
export function SaleActions({ saleId, isAwaitingPayment, canCancel }: SaleActionsProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function cancel() {
    setIsCancelling(true);
    setOutcome(null);
    try {
      await salesContainer().cancelSale.execute({ id: saleId, isAwaitingPayment });
      setIsConfirming(false);
      setOutcome({ kind: "cancelled" });
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof SaleNotCancellableError) {
        setOutcome({ kind: "conflict", message: error.message });
        router.refresh();
      } else {
        setOutcome({ kind: "error", message: errorMessage(error) });
      }
    }
    setIsCancelling(false);
  }

  function openConfirmation() {
    setOutcome(null);
    setIsConfirming(true);
  }

  const canConfirm = outcome?.kind !== "conflict";

  if (!isAwaitingPayment && !isConfirming && outcome === null) return null;

  return (
    <div className="flex flex-col items-end gap-3">
      {isAwaitingPayment && (
        <div className="flex gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={openConfirmation}
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
        </div>
      )}

      {outcome?.kind === "cancelled" && (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900"
        >
          La venta se canceló y el stock de sus productos volvió al inventario.
        </p>
      )}

      <Dialog open={isConfirming} title="¿Cancelar esta venta?" onClose={() => setIsConfirming(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <p>
            La venta quedará <strong>cancelada</strong> y{" "}
            <strong>el stock de todos sus productos se devolverá al inventario</strong>. Esta acción
            no se puede deshacer.
          </p>

          {outcome?.kind === "conflict" && (
            <div
              role="alert"
              className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900"
            >
              <p className="font-medium">{outcome.message}</p>
              <p className="mt-1">Actualizamos la venta para que veas su estado actual.</p>
            </div>
          )}

          {outcome?.kind === "error" && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-red-700">
              {outcome.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              {canConfirm ? "Volver" : "Cerrar"}
            </button>
            {canConfirm && (
              <button
                type="button"
                onClick={() => void cancel()}
                disabled={isCancelling}
                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isCancelling ? "Cancelando…" : "Sí, cancelar venta"}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
