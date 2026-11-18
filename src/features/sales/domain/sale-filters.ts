import { filter } from "@/shared/domain/collections";

import type { Sale } from "./sale";
import { SALE_STATUSES, type SaleStatus } from "./sale-status";

/** The sales in that status; null keeps them all. */
export function filterSalesByStatus(sales: readonly Sale[], status: SaleStatus | null): Sale[] {
  return filter(sales, [status === null ? null : (sale) => sale.status === status]);
}

/** How many sales there are in each status, for the filter. */
export function countByStatus(sales: readonly Sale[]): Readonly<Record<SaleStatus, number>> {
  const counts = Object.fromEntries(SALE_STATUSES.map((status) => [status, 0])) as Record<
    SaleStatus,
    number
  >;
  for (const sale of sales) counts[sale.status] += 1;
  return counts;
}
