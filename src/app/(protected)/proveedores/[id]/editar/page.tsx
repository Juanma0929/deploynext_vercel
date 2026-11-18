import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getSupplier,
  SupplierNotFoundError,
  type SupplierProps,
} from "@/features/suppliers/di/server";
import { SupplierForm } from "@/features/suppliers/presentation";
import { PageHeader } from "@/shared/presentation/ui";

interface EditSupplierPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * The supplier as plain data: the form is a Client Component, and only plain
 * objects can be passed to one. A 404, or a 400 for an id that is not a UUID,
 * renders the not-found.tsx of /proveedores/[id].
 */
async function loadOrNotFound(id: string): Promise<SupplierProps> {
  try {
    const { name, contactName, phone, email, address } = await getSupplier(id);
    return { id, name, contactName, phone, email, address };
  } catch (error: unknown) {
    if (error instanceof SupplierNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: EditSupplierPageProps): Promise<Metadata> {
  const { id } = await params;
  const { name } = await loadOrNotFound(id);
  return { title: `Editar ${name}` };
}

/** Admin only (suppliers:write); the app shell shows the access denied page to anyone else. */
export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const { id } = await params;
  const supplier = await loadOrNotFound(id);

  return (
    <section aria-labelledby="edit-supplier-title" className="flex flex-col gap-6">
      <PageHeader titleId="edit-supplier-title" title="Editar proveedor" />
      <SupplierForm supplier={supplier} />
    </section>
  );
}
