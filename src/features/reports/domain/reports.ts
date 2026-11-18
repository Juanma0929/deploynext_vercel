import type { DateRange } from "@/shared/domain/date-range";
import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

/** The totals of the paid sales of a period. */
export class SalesReport {
  readonly salesCount: number;
  readonly revenue: Money;
  readonly profit: Money;

  constructor(
    readonly range: DateRange,
    props: { readonly salesCount: number; readonly revenue: number; readonly profit: number },
  ) {
    if (!Number.isSafeInteger(props.salesCount) || props.salesCount < 0) {
      throw new DomainError("La cantidad de ventas del reporte no es válida.");
    }
    this.salesCount = props.salesCount;
    this.revenue = Money.cop(props.revenue);
    this.profit = Money.cop(props.profit);
  }
}

/** A product among the best sellers, counting only paid sales. */
export interface TopProduct {
  readonly productId: string;
  readonly name: string;
  readonly quantitySold: number;
  readonly revenue: Money;
  /** Revenue minus the cost of what was sold: the profit of the product. */
  readonly profit: Money;
}

/** What GET /reports/top-products accepts for ?limit= (@Min(1) @Max(50)). */
export const TOP_PRODUCTS_LIMIT = { min: 1, max: 50, default: 10 } as const;

/** Refuses a limit the API would answer 400 to, before any request. */
export function assertTopProductsLimit(limit: number): void {
  if (!Number.isSafeInteger(limit) || limit < TOP_PRODUCTS_LIMIT.min || limit > TOP_PRODUCTS_LIMIT.max) {
    throw new DomainError(
      `La cantidad de productos debe ser un número entero entre ${TOP_PRODUCTS_LIMIT.min} y ${TOP_PRODUCTS_LIMIT.max}.`,
    );
  }
}

/**
 * The share of the revenue that is profit, as a percentage with one decimal,
 * or null when there was no revenue to divide by.
 */
export function profitMargin(product: Pick<TopProduct, "revenue" | "profit">): number | null {
  if (product.revenue.isZero()) return null;
  return Math.round((product.profit.amount / product.revenue.amount) * 1000) / 10;
}

/** An active product whose stock is at or below its minimum. */
export interface LowStockProduct {
  readonly productId: string;
  readonly name: string;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierName: string;
}
