import { browserHttpClient } from "@/shared/di/http";

import { GetAdminDashboardUseCase } from "../application/get-admin-dashboard.use-case";
import { GetTopProductsUseCase } from "../application/get-top-products.use-case";
import { ReportHttpRepository } from "../infrastructure/report.http.repository";

export interface ReportsContainer {
  readonly getAdminDashboard: GetAdminDashboardUseCase;
  readonly getTopProducts: GetTopProductsUseCase;
}

let container: ReportsContainer | null = null;

/** The use cases of reports for the browser, wired once. */
export function reportsContainer(): ReportsContainer {
  if (container !== null) return container;

  const repository = new ReportHttpRepository(browserHttpClient());

  container = {
    getAdminDashboard: new GetAdminDashboardUseCase(repository),
    getTopProducts: new GetTopProductsUseCase(repository),
  };
  return container;
}
