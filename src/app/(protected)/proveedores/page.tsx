import type { Metadata } from "next";

import { DELETED_SUPPLIER_PARAM } from "@/features/suppliers/presentation";

import { SuppliersRoute } from "./suppliers-route";

export const metadata: Metadata = {
  title: "Proveedores",
};

interface SuppliersPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Every role may read it (suppliers:read); only an admin may change it (suppliers:write). */
export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const deleted = (await searchParams)[DELETED_SUPPLIER_PARAM];
  return <SuppliersRoute deletedName={typeof deleted === "string" ? deleted : undefined} />;
}
