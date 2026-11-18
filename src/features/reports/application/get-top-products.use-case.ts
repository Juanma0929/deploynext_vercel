import type { ReportRepository } from "../domain/report.repository";
import { assertTopProductsLimit, type TopProduct } from "../domain/reports";

/**
 * The best sellers, from most to least units sold. Only paid sales count
 * (the API decides that). A limit outside 1–50 is refused before any request.
 */
export class GetTopProductsUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async execute(limit: number): Promise<TopProduct[]> {
    assertTopProductsLimit(limit);
    const products = await this.repository.topProducts(limit);
    return [...products].sort((a, b) => b.quantitySold - a.quantitySold);
  }
}
