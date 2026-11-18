import type { DateRange } from "@/shared/domain/date-range";

import type { LowStockProduct, SalesReport, TopProduct } from "./reports";

/** The reports of the API. Every one of them is admin only. */
export interface ReportRepository {
  salesReport(range: DateRange): Promise<SalesReport>;
  topProducts(limit: number): Promise<TopProduct[]>;
  lowStock(): Promise<LowStockProduct[]>;
}
