import { dayInColombia } from "@/shared/domain/calendar";
import { filter } from "@/shared/domain/collections";
import type { DateRange } from "@/shared/domain/date-range";

import type { Sale } from "./sale";
import type { SaleStatus } from "./sale-status";

/** The filters of the history. A null one is not applied. */
export interface SaleHistoryFilters {
  /** Days in Colombian time, both ends included. */
  readonly range: DateRange | null;
  readonly status: SaleStatus | null;
  readonly sellerId: string | null;
}

export const NO_HISTORY_FILTERS: SaleHistoryFilters = { range: null, status: null, sellerId: null };

/**
 * The range is compared with the day the sale happened in Colombia, not in
 * UTC: a sale at 21:00 on the 3rd in Bogotá is the 4th in UTC, and belongs
 * to the 3rd.
 */
export function filterSaleHistory(sales: readonly Sale[], filters: SaleHistoryFilters): Sale[] {
  const { range, status, sellerId } = filters;

  return filter(sales, [
    range === null ? null : (sale) => range.includes(dayInColombia(sale.createdAt)),
    status === null ? null : (sale) => sale.status === status,
    sellerId === null ? null : (sale) => sale.sellerId === sellerId,
  ]);
}
