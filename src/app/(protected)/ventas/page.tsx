import type { Metadata } from "next";

import { TodaySalesRoute } from "./today-sales-route";

export const metadata: Metadata = {
  title: "Ventas de hoy",
};

/** Admin and seller (sales:read-today). The API returns every sale to an admin and its own to a seller. */
export default function TodaySalesPage() {
  return <TodaySalesRoute />;
}
