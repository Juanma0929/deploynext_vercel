import type { DateRange } from "@/shared/domain/date-range";
import { Money } from "@/shared/domain/money";

import { SalesReport, type LowStockProduct, type TopProduct } from "../domain/reports";
import type { LowStockRowDto, SalesReportDto, TopProductRowDto } from "./dto/report.dto";

export function toSalesReport(range: DateRange, dto: SalesReportDto): SalesReport {
  return new SalesReport(range, {
    salesCount: dto.salesCount,
    revenue: dto.revenue,
    profit: dto.profit,
  });
}

export function toTopProduct(dto: TopProductRowDto): TopProduct {
  return {
    productId: dto.productId,
    name: dto.name,
    quantitySold: dto.quantitySold,
    revenue: Money.cop(dto.revenue),
    profit: Money.cop(dto.profit),
  };
}

export function toLowStockProduct(dto: LowStockRowDto): LowStockProduct {
  return {
    productId: dto.productId,
    name: dto.name,
    currentStock: dto.currentStock,
    minimumStock: dto.minimumStock,
    supplierName: dto.supplierName,
  };
}
