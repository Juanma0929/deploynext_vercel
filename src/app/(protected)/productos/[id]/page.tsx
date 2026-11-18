import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProductDetail,
  ProductNotFoundError,
  type ProductDetail,
} from "@/features/products/di/server";
import { ProductDetailView } from "@/features/products/presentation";

interface ProductPageProps {
  readonly params: Promise<{ readonly id: string }>;
}

/**
 * The product, or not-found.tsx when the API answers 404, or 400 because the
 * id is not a UUID. getProductDetail is cached per request, so the metadata
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { product } = await loadOrNotFound(id);
  return { title: product.name };
}

/** Every role may read it (products:read). */
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailView detail={await loadOrNotFound(id)} />;
}
