import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Can } from "@/features/auth/presentation";
import {
  getSupplierDetail,
  SupplierNotFoundError,
  type SupplierDetail,
} from "@/features/suppliers/di/server";
import { DeleteSupplierButton, SupplierDetailView } from "@/features/suppliers/presentation";
import { ButtonLink } from "@/shared/presentation/ui";

interface SupplierPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * The supplier, or not-found.tsx when the API answers 404, or 400 because the
 * id is not a UUID. getSupplierDetail is cached per request, so the metadata
 * and the page share the same two API calls.
 */
async function loadOrNotFound(id: string): Promise<SupplierDetail> {
  try {
    return await getSupplierDetail(id);
  } catch (error: unknown) {
    if (error instanceof SupplierNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: SupplierPageProps): Promise<Metadata> {
  const { id } = await params;
  const { supplier } = await loadOrNotFound(id);
  return { title: supplier.name };
}

export default async function SupplierPage({ params }: SupplierPageProps) {
  const { id } = await params;
  const detail = await loadOrNotFound(id);

  return (
    <SupplierDetailView
      detail={detail}
      actions={
        <Can permission="suppliers:write">
          <div className="flex gap-2">
            <ButtonLink href={`/proveedores/${detail.supplier.id}/editar`} variant="secondary">
              Editar
            </ButtonLink>
            <DeleteSupplierButton
              supplierId={detail.supplier.id}
              supplierName={detail.supplier.name}
            />
          </div>
        </Can>
      }
    />
  );
}
