import type { Metadata } from "next";

import { LowStockReport, SalesPeriodReport, TopProductsReport } from "@/features/reports/presentation";
import { PageHeader } from "@/shared/presentation/ui";

export const metadata: Metadata = {
  title: "Reportes",
};

/** Admin only (reports:read); the app shell shows the access denied page to anyone else. */
export default function ReportsPage() {
  return (
    <section aria-labelledby="reports-title" className="flex flex-col gap-6">
      <PageHeader titleId="reports-title" title="Reportes" description="Solo cuentan las ventas pagadas." />
      <SalesPeriodReport />
      <TopProductsReport />
      <LowStockReport />
    </section>
  );
}
