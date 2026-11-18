"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { Alert, Button, ButtonLink, Modal, ModalActions } from "@/shared/presentation/ui";

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
            <Button variant="danger-outline" onClick={openConfirmation}>
              Cancelar venta
            </Button>
          )}
          <ButtonLink href={`/ventas/${saleId}/cobrar`}>Cobrar</ButtonLink>
        </div>
      )}

      {outcome?.kind === "cancelled" && (
        <Alert tone="success">
          <p>La venta se canceló y el stock de sus productos volvió al inventario.</p>
        </Alert>
      )}

      <Modal open={isConfirming} title="¿Cancelar esta venta?" onClose={() => setIsConfirming(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <p>
            La venta quedará <strong>cancelada</strong> y{" "}
            <strong>el stock de todos sus productos se devolverá al inventario</strong>. Esta acción
            no se puede deshacer.
          </p>

          {outcome?.kind === "conflict" && (
            <Alert tone="warning">
              <p className="font-medium">{outcome.message}</p>
              <p>Actualizamos la venta para que veas su estado actual.</p>
            </Alert>
          )}

          {outcome?.kind === "error" && (
            <Alert tone="danger">
              <p>{outcome.message}</p>
            </Alert>
          )}

          <ModalActions>
            <Button variant="secondary" onClick={() => setIsConfirming(false)}>
              {canConfirm ? "Volver" : "Cerrar"}
            </Button>
            {canConfirm && (
              <Button
                variant="danger"
                onClick={() => void cancel()}
                isLoading={isCancelling}
                loadingText="Cancelando…"
              >
                Sí, cancelar venta
              </Button>
            )}
          </ModalActions>
        </div>
      </Modal>
    </div>
  );
}
