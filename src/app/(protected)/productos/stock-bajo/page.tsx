import type { Metadata } from "next";

import { listLowStock } from "@/features/products/di/server";
import { LOW_STOCK_PATH, LowStockScreen } from "@/features/products/presentation";

export const metadata: Metadata = {
  title: "Stock bajo",
};

/**
 * Every role may read it (products:read): GET /products/low-stock is open to
 * admin and seller. The loading.tsx and error.tsx of /productos cover it.
 */
export default async function LowStockPage() {
  return <LowStockScreen rows={await listLowStock(LOW_STOCK_PATH)} />;
}
