"use client";

import { NewSaleProvider } from "./new-sale-context";
import { PrefillNotice } from "./prefill-notice";
import { ProductPicker } from "./product-picker";
import { SaleCart } from "./sale-cart";

interface NewSaleScreenProps {
  /** An earlier sale to copy the items from (?desde=), as when a declined sale is retried. */
  readonly fromSaleId?: string | undefined;
}

/** Puts a sale together and registers it. For admins and sellers (sales:create). */
export function NewSaleScreen({ fromSaleId }: NewSaleScreenProps) {
  return (
    <NewSaleProvider fromSaleId={fromSaleId}>
      <section aria-labelledby="new-sale-title" className="flex flex-col gap-6">
        <header>
          <h1 id="new-sale-title" className="text-2xl font-semibold">
            Nueva venta
          </h1>
          <p className="text-muted text-sm">
            Agrega los productos y registra la venta. El stock se descuenta al registrarla.
          </p>
        </header>
        <PrefillNotice />
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
          <ProductPicker />
          <SaleCart />
        </div>
      </section>
    </NewSaleProvider>
  );
}
