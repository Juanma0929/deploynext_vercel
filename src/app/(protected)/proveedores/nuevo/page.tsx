import type { Metadata } from "next";

import { SupplierForm } from "@/features/suppliers/presentation";

export const metadata: Metadata = {
  title: "Nuevo proveedor",
};

/** Admin only (suppliers:write); the app shell shows the access denied page to anyone else. */
export default function NewSupplierPage() {
  return (
    <section aria-labelledby="new-supplier-title" className="flex flex-col gap-6">
      <h1 id="new-supplier-title" className="text-2xl font-semibold">
        Nuevo proveedor
      </h1>
      <SupplierForm />
    </section>
  );
}
