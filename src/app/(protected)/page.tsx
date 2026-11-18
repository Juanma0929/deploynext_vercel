import type { Metadata } from "next";

import { HomeByRole } from "@/features/auth/presentation";
import { LowStockAlert } from "@/features/products/presentation";
import { AdminDashboard } from "@/features/reports/presentation";
import { SellerHome } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Inicio",
};

/**
 * The home page changes with the role: the dashboard for an admin, the sales
 * of the day for a seller. Both see the low stock alert first.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <LowStockAlert />
      <HomeByRole admin={<AdminDashboard />} seller={<SellerHome />} />
    </div>
  );
}
