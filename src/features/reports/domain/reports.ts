import { daysOf } from "@/shared/domain/calendar";
import type { DateRange } from "@/shared/domain/date-range";
import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

/** The paid sales of one day (YYYY-MM-DD, Colombian time). */
export interface DailySales {
  readonly date: string;
  readonly salesCount: number;
  readonly revenue: Money;
  readonly profit: Money;
}

export interface DailySalesProps {
  readonly date: string;
  readonly salesCount: number;
  readonly revenue: number;
  readonly profit: number;
}

/** The totals of the paid sales of a period, and the same day by day. */
export class SalesReport {
  readonly salesCount: number;
  readonly revenue: Money;
  readonly profit: Money;
  /** Every day of the range, in order; the days without sales count 0. */
  readonly byDay: readonly DailySales[];

  constructor(
    readonly range: DateRange,
    props: {
      readonly salesCount: number;
      readonly revenue: number;
      readonly profit: number;
      readonly byDay?: readonly DailySalesProps[];
    },
  ) {
    if (!Number.isSafeInteger(props.salesCount) || props.salesCount < 0) {
      throw new DomainError("La cantidad de ventas del reporte no es válida.");
    }
    this.salesCount = props.salesCount;
    this.revenue = Money.cop(props.revenue);
    this.profit = Money.cop(props.profit);
    this.byDay = fillMissingDays(range, props.byDay ?? []);
  }

  /** The share of the revenue that is profit, in %, or null without revenue. */
  get margin(): number | null {
    return profitMargin(this);
  }
}

/**
 * The API sends only the days that had sales. A chart over that would join
 * Monday to Thursday as if Tuesday and Wednesday did not exist, so every day
 * of the range is listed, with 0 for the ones that are missing. Days outside
 * the range are dropped.
 */
export function fillMissingDays(range: DateRange, days: readonly DailySalesProps[]): DailySales[] {
  const byDate = new Map(days.map((day) => [day.date, day]));

  return daysOf(range).map((date) => {
    const day = byDate.get(date);
    return {
      date,
      salesCount: day?.salesCount ?? 0,
      revenue: Money.cop(day?.revenue ?? 0),
      profit: Money.cop(day?.profit ?? 0),
    };
  });
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
