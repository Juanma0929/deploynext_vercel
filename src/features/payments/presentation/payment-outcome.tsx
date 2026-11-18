import Link from "next/link";
import type { ReactNode } from "react";

import { Alert, ButtonLink } from "@/shared/presentation/ui";

import { PaymentStatusPanel } from "./payment-status-panel";

interface ChargeStartedProps {
  readonly saleId: string;
  readonly transactionId: string;
  readonly title: string;
  /** What happens now, for this method. */
  readonly children: ReactNode;
}

/**
 * What both forms show once Wompi accepted the charge. The sale stays pending
 * until the result is known, so below it the status is followed live.
 *
 * The page is not refreshed when the payment settles: it would render again
 * for a sale that is no longer awaiting payment, and this would be gone.
 */
export function ChargeStarted({ saleId, transactionId, title, children }: ChargeStartedProps) {
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-semibold">{title}</p>
        {children}
        {transactionId !== "" && (
          <p>
            Transacción de Wompi: <span className="font-mono text-xs break-all">{transactionId}</span>
          </p>
        )}
      </div>

      <PaymentStatusPanel saleId={saleId} initialStatus="pending" />

      <ButtonLink href={`/ventas/${saleId}`} variant="secondary" className="self-start">
        Ver la venta
      </ButtonLink>
    </div>
  );
}

/** The API answered 409: this sale was charged, or is being charged, already. */
export function NotChargeable({ saleId, message }: { readonly saleId: string; readonly message: string }) {
  return (
    <Alert tone="warning" className="max-w-lg">
      <p className="font-medium">{message}</p>
      <Link href={`/ventas/${saleId}`} className="font-medium underline underline-offset-2">
        Ver el estado de la venta
      </Link>
    </Alert>
  );
}
