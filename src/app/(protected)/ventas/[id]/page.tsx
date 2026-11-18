import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getSaleDetail,
  SaleNotFoundError,
  SaleNotYoursError,
  type SaleDetail,
} from "@/features/sales/di/server";
import { PaymentStatusPanel } from "@/features/payments/presentation";
import { SaleDetailView, SaleNotYours } from "@/features/sales/presentation";

import { SaleActionsRoute } from "./sale-actions-route";

export const metadata: Metadata = {
  title: "Detalle de venta",
};

interface SalePageProps {
  readonly params: Promise<{ readonly id: string }>;
}

type Loaded = { readonly kind: "found"; readonly detail: SaleDetail } | { readonly kind: "not-yours" };

/** not-found.tsx for a 404 or a non-UUID id; "Esta venta no es tuya" for a 403. */
async function load(id: string): Promise<Loaded> {
  try {
    return { kind: "found", detail: await getSaleDetail(id) };
  } catch (error: unknown) {
    if (error instanceof SaleNotFoundError) notFound();
    if (error instanceof SaleNotYoursError) return { kind: "not-yours" };
    throw error;
  }
}

/** Admins see any sale; a seller only its own (the API answers 403 otherwise). */
export default async function SalePage({ params }: SalePageProps) {
  const { id } = await params;
  const loaded = await load(id);

  if (loaded.kind === "not-yours") return <SaleNotYours />;

  const { sale } = loaded.detail;
  return (
    <SaleDetailView
      detail={loaded.detail}
      actions={
        <div className="flex flex-col items-end gap-3">
          <SaleActionsRoute saleId={sale.id} isAwaitingPayment={sale.isAwaitingPayment} />
          {/*
           * Once the sale has a payment: polls while it is pending, or shows how
           * it ended. Refreshing keeps it on screen, since the sale still has
           * its transaction, and updates the rest of the detail.
           */}
          {sale.paymentTransactionId !== null && (
            <PaymentStatusPanel saleId={sale.id} initialStatus={sale.status} refreshOnSettle />
          )}
        </div>
      }
    />
  );
}
