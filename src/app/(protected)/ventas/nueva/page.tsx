import type { Metadata } from "next";

import { NewSaleScreen } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Nueva venta",
};

/** Admin and seller (sales:create); the app shell shows the access denied page to anyone else. */
export default function NewSalePage() {
  return <NewSaleScreen />;
}
