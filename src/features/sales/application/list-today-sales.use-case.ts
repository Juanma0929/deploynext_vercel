import { summarizeSales, type Sale, type SalesSummary } from "../domain/sale";
import type { SaleRepository } from "../domain/sale.repository";

export interface TodaySales {
  readonly sales: readonly Sale[];
  readonly summary: SalesSummary;
}

/** The sales of the day with their totals, for the home page of the seller. */
export class ListTodaySalesUseCase {
  constructor(private readonly repository: SaleRepository) {}

  async execute(): Promise<TodaySales> {
    const sales = await this.repository.findToday();
    return { sales, summary: summarizeSales(sales) };
  }
}
