"use client";

import type { DateRange } from "@/shared/domain/date-range";
import { onDataChanged } from "@/shared/presentation/data-changes";
import { createResource, createResourceFamily } from "@/shared/presentation/store";

import { reportsContainer } from "../di/container";

/**
 * The store of reports. Each report is kept by what it was asked for (a date
 * range, a limit), so going back to a range already seen shows it at once
 * while it is asked again. A sale or a change of stock makes them stale;
 * logging out forgets all of them.
 */
export const adminDashboardResource = createResource(() =>
  reportsContainer().getAdminDashboard.execute(new Date()),
);

export const lowStockReportResource = createResource(() => reportsContainer().getLowStockReport.execute());

export const salesReportResources = createResourceFamily(
  (range: DateRange) => `${range.from}/${range.to}`,
  (range: DateRange) => reportsContainer().getSalesReport.execute(range),
);

export const topProductsResources = createResourceFamily(
  (limit: number) => String(limit),
  (limit: number) => reportsContainer().getTopProducts.execute(limit),
);

function invalidateAll() {
  adminDashboardResource.invalidate();
  lowStockReportResource.invalidate();
  salesReportResources.invalidate();
  topProductsResources.invalidate();
}

onDataChanged("sales", invalidateAll);
onDataChanged("products", invalidateAll);
