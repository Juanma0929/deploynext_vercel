import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getSupplierDetail,
  SupplierNotFoundError,
  type SupplierDetail,
} from "@/features/suppliers/di/server";
import { SupplierDetailView } from "@/features/suppliers/presentation";

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
  return <SupplierDetailView detail={await loadOrNotFound(id)} />;
}
