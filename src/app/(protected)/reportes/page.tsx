import type { Metadata } from "next";

import { TopProductsReport } from "@/features/reports/presentation";

export const metadata: Metadata = {
  title: "Reportes",
};

/** Admin only (reports:read); the app shell shows the access denied page to anyone else. */
export default function ReportsPage() {
  return (
    <section aria-labelledby="reports-title" className="flex flex-col gap-6">
      <header>
        <h1 id="reports-title" className="text-2xl font-semibold">
          Reportes
        </h1>
        <p className="text-muted text-sm">Solo cuentan las ventas pagadas.</p>
      </header>
      <TopProductsReport />
    </section>
  );
}
