import type { Metadata } from "next";

import { listSupplierOptions } from "@/features/products/di/server";
import { ProductForm } from "@/features/products/presentation";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

/**
 * Admin only (products:write); the app shell shows the access denied page to
 * anyone else. The suppliers of the select are loaded here, on the server.
 */
export default async function NewProductPage() {
  const suppliers = await listSupplierOptions("/productos/nuevo");

  return (
    <section aria-labelledby="new-product-title" className="flex flex-col gap-6">
      <h1 id="new-product-title" className="text-2xl font-semibold">
        Nuevo producto
      </h1>
      <ProductForm suppliers={suppliers} />
    </section>
  );
}
