import type { Metadata } from "next";
import Link from "next/link";

import { Can } from "@/features/auth/presentation";
import { listInventory } from "@/features/products/di/server";
import {
  InventoryScreen,
  inventoryHref,
  parseInventoryQuery,
  type SearchParams,
} from "@/features/products/presentation";

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
  const query = parseInventoryQuery(await searchParams);
  const inventory = await listInventory(query.filters, query.page, inventoryHref(query));

  return (
    <InventoryScreen
      inventory={inventory}
      query={query}
      actions={
        <Can permission="products:write">
          <Link
            href="/productos/nuevo"
            className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Nuevo producto
          </Link>
        </Can>
      }
    />
  );
}
