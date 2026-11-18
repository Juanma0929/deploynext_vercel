import type { DateRange } from "@/shared/domain/date-range";

import type { ReportRepository } from "../domain/report.repository";
import type { SalesReport } from "../domain/reports";

/**
 * The paid sales of a period, in total and day by day, with the days without
 * sales already filled with 0. The range is a DateRange, so it is a valid
 * pair of days with `from` not after `to` before any request is made.
 */
export class GetSalesReportUseCase {
  constructor(private readonly repository: ReportRepository) {}

  execute(range: DateRange): Promise<SalesReport> {
    return this.repository.salesReport(range);
  }
}
