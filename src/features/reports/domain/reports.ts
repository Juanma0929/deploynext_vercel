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
}

/** An active product whose stock is at or below its minimum. */
export interface LowStockProduct {
  readonly productId: string;
  readonly name: string;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierName: string;
}
