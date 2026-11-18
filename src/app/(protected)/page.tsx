import type { Metadata } from "next";

import { HomeByRole } from "@/features/auth/presentation";
import { AdminDashboard } from "@/features/reports/presentation";
import { SellerHome } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Inicio",
};

/** The home page changes with the role: the dashboard for an admin, the sales of the day for a seller. */
export default function HomePage() {
  return <HomeByRole admin={<AdminDashboard />} seller={<SellerHome />} />;
}
