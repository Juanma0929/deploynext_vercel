import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Can } from "@/features/auth/presentation";
import {
  getProductDetail,
  ProductNotFoundError,
  type ProductDetail,
} from "@/features/products/di/server";
import {
  DeleteProductButton,
  ProductDetailView,
  ProductQuickActions,
} from "@/features/products/presentation";
import { ButtonLink } from "@/shared/presentation/ui";

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

/** Every role may read it (products:read); only an admin (products:write) may change it. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const detail = await loadOrNotFound(id);

  return (
    <ProductDetailView
      detail={detail}
      actions={
        <Can permission="products:write">
          <div className="flex gap-2">
            <ButtonLink href={`/productos/${detail.product.id}/editar`} variant="secondary">
              Editar
            </ButtonLink>
            <DeleteProductButton product={detail.product.toProps()} />
          </div>
        </Can>
      }
      adminPanel={
        <Can permission="products:write">
          {/* Plain data: a Client Component cannot receive the Product class. */}
          <ProductQuickActions product={detail.product.toProps()} />
        </Can>
      }
    />
  );
}
