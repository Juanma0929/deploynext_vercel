import type { ReportRepository } from "../domain/report.repository";
import { byUrgency, isOutOfStock, type LowStockProduct } from "../domain/reports";

export interface LowStockReport {
  /** Most urgent first. */
  readonly products: readonly LowStockProduct[];
  readonly outOfStockCount: number;
}

/**
 * The active products at or below their minimum stock. Each row already
 * carries its supplier's name, so nothing else is asked for.
 */
export class GetLowStockReportUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async execute(): Promise<LowStockReport> {
    const products = [...(await this.repository.lowStock())].sort(byUrgency);
    return { products, outOfStockCount: products.filter(isOutOfStock).length };
  }
}
