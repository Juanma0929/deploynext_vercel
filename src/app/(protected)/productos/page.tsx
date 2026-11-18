import type { Metadata } from "next";

import { Can } from "@/features/auth/presentation";
import { listInventory } from "@/features/products/di/server";
import {
  DELETED_PRODUCT_PARAM,
  InventoryScreen,
  inventoryHref,
  parseInventoryQuery,
  type SearchParams,
} from "@/features/products/presentation";
import { ButtonLink } from "@/shared/presentation/ui";

export const metadata: Metadata = {
  title: "Productos",
};

interface ProductsPageProps {
  readonly searchParams: Promise<SearchParams>;
}

/**
 * The inventory, for every role (products:read). It renders on the server
 * from the filters in the URL; loading.tsx shows while the API answers and
 * error.tsx if it fails. Only an admin (products:write) sees "Nuevo producto".
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = parseInventoryQuery(params);
  const inventory = await listInventory(query.filters, query.page, inventoryHref(query));
  const deleted = params[DELETED_PRODUCT_PARAM];

  return (
    <InventoryScreen
      inventory={inventory}
      query={query}
      deletedName={typeof deleted === "string" ? deleted : undefined}
      actions={
        <Can permission="products:write">
          <ButtonLink href="/productos/nuevo">Nuevo producto</ButtonLink>
        </Can>
      }
    />
  );
}
