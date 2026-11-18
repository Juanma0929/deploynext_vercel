import type { Metadata } from "next";

import { SalesHistoryScreen } from "@/features/sales/presentation";

export const metadata: Metadata = {
  title: "Historial de ventas",
};

/** Admin only (sales:history); the app shell shows the access denied page to anyone else. */
export default function SalesHistoryPage() {
  return <SalesHistoryScreen />;
}
