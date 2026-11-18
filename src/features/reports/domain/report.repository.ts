import type { DateRange } from "@/shared/domain/date-range";

import type { LowStockProduct, SalesReport, TopProduct } from "./reports";

/** The reports of the API. Every one of them is admin only. */
export interface ReportRepository {
  salesReport(range: DateRange): Promise<SalesReport>;
  /** The same report as a PDF file, with the same validations. */
  salesReportPdf(range: DateRange): Promise<Blob>;
  topProducts(limit: number): Promise<TopProduct[]>;
  lowStock(): Promise<LowStockProduct[]>;
}
