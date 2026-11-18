import type { Metadata } from "next";

import { SupplierForm } from "@/features/suppliers/presentation";
import { PageHeader } from "@/shared/presentation/ui";

export const metadata: Metadata = {
  title: "Nuevo proveedor",
};

/** Admin only (suppliers:write); the app shell shows the access denied page to anyone else. */
export default function NewSupplierPage() {
  return (
    <section aria-labelledby="new-supplier-title" className="flex flex-col gap-6">
      <PageHeader titleId="new-supplier-title" title="Nuevo proveedor" />
      <SupplierForm />
    </section>
  );
}
