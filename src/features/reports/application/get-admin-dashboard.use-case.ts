import { lastDays, todayInColombia } from "@/shared/domain/calendar";

import type { ReportRepository } from "../domain/report.repository";
import type { LowStockProduct, SalesReport, TopProduct } from "../domain/reports";

export const DASHBOARD_DAYS = 30;
export const DASHBOARD_TOP_PRODUCTS = 5;

export interface AdminDashboard {
  readonly sales: SalesReport;
  readonly topProducts: readonly TopProduct[];
  readonly lowStock: readonly LowStockProduct[];
}

/**
 * The home page of an admin: the sales of the last 30 days, the best sellers
 * and what is running out. The three reports are asked at the same time.
 */
export class GetAdminDashboardUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async execute(now: Date): Promise<AdminDashboard> {
    const range = lastDays(todayInColombia(now), DASHBOARD_DAYS);

    const [sales, topProducts, lowStock] = await Promise.all([
      this.repository.salesReport(range),
      this.repository.topProducts(DASHBOARD_TOP_PRODUCTS),
      this.repository.lowStock(),
    ]);

    return { sales, topProducts, lowStock };
  }
}
