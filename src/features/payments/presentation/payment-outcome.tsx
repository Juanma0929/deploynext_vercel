import Link from "next/link";
import type { ReactNode } from "react";

interface ChargeStartedProps {
  readonly saleId: string;
  readonly transactionId: string;
  readonly title: string;
  /** What happens now, for this method. */
  readonly children: ReactNode;
}

/**
 * What both forms show once Wompi accepted the charge: the sale stays pending
 * until the result is known, so this links back to it.
 */
export function ChargeStarted({ saleId, transactionId, title, children }: ChargeStartedProps) {
  return (
    <div
      role="status"
      className="flex max-w-lg flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950"
    >
      <p className="font-semibold">{title}</p>
      {children}
      {transactionId !== "" && (
        <p>
          Transacción de Wompi: <span className="font-mono text-xs break-all">{transactionId}</span>
        </p>
      )}
      <Link
        href={`/ventas/${saleId}`}
        className="bg-primary self-start rounded-md px-4 py-2 font-medium text-white"
      >
        Ver la venta
      </Link>
    </div>
  );
}

/** The API answered 409: this sale was charged, or is being charged, already. */
export function NotChargeable({ saleId, message }: { readonly saleId: string; readonly message: string }) {
  return (
    <div
      role="alert"
      className="flex max-w-lg flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
    >
      <p className="font-medium">{message}</p>
      <Link href={`/ventas/${saleId}`} className="font-medium underline underline-offset-2">
        Ver el estado de la venta
      </Link>
    </div>
  );
}
