import type { DateRange } from "@/shared/domain/date-range";
import type { HttpClient } from "@/shared/infrastructure/http";

import type { ReportRepository } from "../domain/report.repository";
import type { LowStockProduct, SalesReport, TopProduct } from "../domain/reports";
import type { LowStockRowDto, SalesReportDto, TopProductRowDto } from "./dto/report.dto";
import { toLowStockProduct, toSalesReport, toTopProduct } from "./report.mapper";

export class ReportHttpRepository implements ReportRepository {
  constructor(private readonly http: HttpClient) {}

  async salesReport(range: DateRange): Promise<SalesReport> {
    const dto = await this.http.get<SalesReportDto>("/reports/sales", {
      query: { from: range.from, to: range.to },
    });
    return toSalesReport(range, dto);
  }

  async topProducts(limit: number): Promise<TopProduct[]> {
    const dtos = await this.http.get<TopProductRowDto[]>("/reports/top-products", {
      query: { limit },
    });
    return dtos.map(toTopProduct);
  }

  async lowStock(): Promise<LowStockProduct[]> {
    const dtos = await this.http.get<LowStockRowDto[]>("/reports/low-stock");
    return dtos.map(toLowStockProduct);
  }
}
