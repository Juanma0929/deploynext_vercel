import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChargeSalePanel } from "@/features/payments/presentation";
import {
  getSaleDetail,
  SaleNotFoundError,
  SaleNotYoursError,
  type SaleDetail,
} from "@/features/sales/di/server";
import { SaleNotYours } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Cobrar venta",
};

interface ChargeSalePageProps {
  readonly params: Promise<{ readonly id: string }>;
}

type Loaded = { readonly kind: "found"; readonly detail: SaleDetail } | { readonly kind: "not-yours" };

/** not-found.tsx of /ventas/[id] for a 404 or a non-UUID id; "Esta venta no es tuya" for a 403. */
async function load(id: string): Promise<Loaded> {
  try {
    return { kind: "found", detail: await getSaleDetail(id) };
  } catch (error: unknown) {
    if (error instanceof SaleNotFoundError) notFound();
    if (error instanceof SaleNotYoursError) return { kind: "not-yours" };
    throw error;
  }
}

/**
 * Admin and seller (sales:charge); a seller only its own sales, which the API
 * checks. The sale is read on the server to show its total, and to say so
 * when it can no longer be charged instead of offering a form the API would
 * refuse with 409.
 */
export default async function ChargeSalePage({ params }: ChargeSalePageProps) {
  const { id } = await params;
  const loaded = await load(id);

  if (loaded.kind === "not-yours") return <SaleNotYours />;

  const { sale } = loaded.detail;
  const total = sale.total.format();

  return (
    <section aria-labelledby="charge-title" className="flex flex-col gap-6">
      <nav aria-label="Ruta" className="text-muted text-sm">
        <Link href={`/ventas/${sale.id}`} className="hover:underline">
          Venta
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Cobrar</span>
      </nav>

      <header>
        <h1 id="charge-title" className="text-2xl font-semibold">
          Cobrar venta
        </h1>
        <p className="text-muted text-sm">
          {sale.itemCount === 1 ? "1 producto" : `${sale.itemCount} productos`} · Total a cobrar{" "}
          <strong className="text-foreground tabular-nums">{total}</strong>
        </p>
      </header>

      {sale.isAwaitingPayment ? (
        <ChargeSalePanel saleId={sale.id} totalLabel={total} />
      ) : (
        <div className="flex max-w-lg flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">
            Esta venta ya no se puede cobrar: ya tiene un pago, o ya no está pendiente.
          </p>
          <Link href={`/ventas/${sale.id}`} className="font-medium underline underline-offset-2">
            Ver el estado de la venta
          </Link>
        </div>
      )}
    </section>
  );
}
