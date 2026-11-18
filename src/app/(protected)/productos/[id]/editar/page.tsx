import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProductDetail,
  listSupplierOptions,
  ProductNotFoundError,
  type ProductDetail,
} from "@/features/products/di/server";
import { ProductForm } from "@/features/products/presentation";

interface EditProductPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * A 404, or a 400 for an id that is not a UUID, renders the not-found.tsx of
 * /productos/[id]. getProductDetail is cached per request, so the metadata
 * and the page share the same API calls.
 */
async function loadOrNotFound(id: string): Promise<ProductDetail> {
  try {
    return await getProductDetail(id);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { product } = await loadOrNotFound(id);
  return { title: `Editar ${product.name}` };
}

/** Admin only (products:write); the app shell shows the access denied page to anyone else. */
export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [{ product }, suppliers] = await Promise.all([
    loadOrNotFound(id),
    listSupplierOptions(`/productos/${encodeURIComponent(id)}/editar`),
  ]);

  return (
    <section aria-labelledby="edit-product-title" className="flex flex-col gap-6">
      <h1 id="edit-product-title" className="text-2xl font-semibold">
        Editar producto
      </h1>
      {/* Plain data: the form is a Client Component. */}
      <ProductForm suppliers={suppliers} product={product.toProps()} />
    </section>
  );
}
