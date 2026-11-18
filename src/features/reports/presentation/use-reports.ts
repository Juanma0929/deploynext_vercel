"use client";

import { useCallback } from "react";

import type { DateRange } from "@/shared/domain/date-range";
import { loadStateOf, useResource, type LoadState, type Resource } from "@/shared/presentation/store";

import type { ReportFile } from "../application/download-sales-report-pdf.use-case";
import type { AdminDashboard } from "../application/get-admin-dashboard.use-case";
import type { LowStockReport } from "../application/get-low-stock-report.use-case";
import { reportsContainer } from "../di/container";
import type { SalesReport, TopProduct } from "../domain/reports";
import {
  adminDashboardResource,
  lowStockReportResource,
  salesReportResources,
  topProductsResources,
} from "./reports-store";

export type ReportView<T> = LoadState<T> & { readonly reload: () => void };

/** The reports the screen shows; the ones it does not ask for are not loaded. */
export interface ReportsOptions {
  readonly dashboard?: boolean;
  readonly lowStock?: boolean;
  /** The period of the sales report. */
  readonly salesRange?: DateRange;
  /** How many best sellers to show. */
  readonly topProductsLimit?: number;
}

export interface ReportsFacade {
  readonly dashboard: ReportView<AdminDashboard>;
  readonly lowStock: ReportView<LowStockReport>;
  readonly sales: ReportView<SalesReport>;
  readonly topProducts: ReportView<readonly TopProduct[]>;
  /** The PDF of the sales of `range`, to save it. */
  readonly downloadSalesPdf: (range: DateRange) => Promise<ReportFile>;
}

/**
 * The facade of reports: the only way components read them. They come from
 * the reports store, kept by range or limit, and are asked again each time a
 * screen that shows them opens.
 */
export function useReports(options: ReportsOptions = {}): ReportsFacade {
  const { salesRange, topProductsLimit } = options;

  const dashboard = useView(adminDashboardResource, options.dashboard === true);
  const lowStock = useView(lowStockReportResource, options.lowStock === true);
  const sales = useView(salesRange === undefined ? null : salesReportResources.get(salesRange), true);
  const topProducts = useView(
    topProductsLimit === undefined ? null : topProductsResources.get(topProductsLimit),
    true,
  );

  const downloadSalesPdf = useCallback(
    (range: DateRange) => reportsContainer().downloadSalesReportPdf.execute(range),
    [],
  );

  return { dashboard, lowStock, sales, topProducts, downloadSalesPdf };
}

function useView<T>(resource: Resource<T> | null, isWanted: boolean): ReportView<T> {
  const state = loadStateOf(useResource(resource, isWanted ? "fresh" : "none"));
  const reload = useCallback(() => void resource?.reload(), [resource]);
  return { ...state, reload };
}
