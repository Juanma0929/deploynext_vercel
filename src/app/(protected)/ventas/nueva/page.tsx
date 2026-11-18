import type { Metadata } from "next";

import { NewSaleScreen } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Nueva venta",
};

interface NewSalePageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Admin and seller (sales:create); the app shell shows the access denied page
 * to anyone else. ?desde=<id> starts the cart with the items of that sale,
 * which is how a declined payment is tried again.
 */
export default async function NewSalePage({ searchParams }: NewSalePageProps) {
  const from = (await searchParams).desde;
  return <NewSaleScreen fromSaleId={typeof from === "string" && from !== "" ? from : undefined} />;
}
