"use client";

import { Alert } from "@/shared/presentation/ui";

import { useNewSale } from "./use-new-sale";

/** What happened when the cart was filled from an earlier sale. Nothing for an empty start. */
export function PrefillNotice() {
  const { prefill } = useNewSale();
  if (prefill === null) return null;

  if (prefill.status === "failed") {
    return (
      <Alert tone="warning">
        <p>No se pudieron copiar los productos de la venta anterior ({prefill.message}). Agrégalos a mano.</p>
      </Alert>
    );
  }

  return (
    <Alert tone="info">
      <p className="font-medium">Copiamos los productos de la venta rechazada.</p>
      <p>Revisa el carrito y registra la venta para cobrarla de nuevo.</p>
      {prefill.adjustments.length > 0 && (
        <>
          <p className="mt-1">Algunos cambiaron desde entonces:</p>
          <ul className="list-disc pl-5">
            {prefill.adjustments.map((adjustment) => (
              <li key={`${adjustment.productName}-${adjustment.kind}`}>
                {adjustment.kind === "removed"
                  ? `${adjustment.productName}: ya no está disponible, no se agregó.`
                  : `${adjustment.productName}: solo hay ${adjustment.quantity ?? 0}, se ajustó la cantidad.`}
              </li>
            ))}
          </ul>
        </>
      )}
    </Alert>
  );
}
