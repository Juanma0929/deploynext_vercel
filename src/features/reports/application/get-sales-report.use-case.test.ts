import { describe, expect, it } from "vitest";

import { DateRange } from "@/shared/domain/date-range";

import type { ReportRepository } from "../domain/report.repository";
import { SalesReport, type DailySalesProps } from "../domain/reports";
import { GetSalesReportUseCase } from "./get-sales-report.use-case";

/**
 * A fake of GET /reports/sales: like the API, it sends only the days that had
 * sales (and here one day outside the range, which must be dropped).
 */
class FakeReportRepository implements ReportRepository {
  readonly asked: DateRange[] = [];

  constructor(private readonly days: readonly DailySalesProps[]) {}

  async salesReport(range: DateRange): Promise<SalesReport> {
    this.asked.push(range);
    const inTotals = this.days.filter((day) => range.includes(day.date));
    return new SalesReport(range, {
      salesCount: inTotals.reduce((count, day) => count + day.salesCount, 0),
      revenue: inTotals.reduce((total, day) => total + day.revenue, 0),
      profit: inTotals.reduce((total, day) => total + day.profit, 0),
      byDay: this.days,
    });
  }

  salesReportPdf(): Promise<Blob> {
    throw new Error("Not used by this use case.");
  }
  topProducts(): Promise<never[]> {
    throw new Error("Not used by this use case.");
  }
  lowStock(): Promise<never[]> {
    throw new Error("Not used by this use case.");
  }
}

const SPARSE_DAYS: readonly DailySalesProps[] = [
  { date: "2026-11-02", salesCount: 3, revenue: 30_000, profit: 9_000 },
  { date: "2026-11-05", salesCount: 1, revenue: 8_000, profit: 2_000 },
  { date: "2026-12-01", salesCount: 9, revenue: 99_000, profit: 9_000 },
];

describe("GetSalesReportUseCase: filling byDay", () => {
  it("lists every day of the range, in order, with 0 on the days without sales", async () => {
    const range = DateRange.create("2026-11-01", "2026-11-06");
    const report = await new GetSalesReportUseCase(new FakeReportRepository(SPARSE_DAYS)).execute(range);

    expect(report.byDay.map((day) => [day.date, day.salesCount, day.revenue.amount, day.profit.amount])).toEqual([
      ["2026-11-01", 0, 0, 0],
      ["2026-11-02", 3, 30_000, 9_000],
      ["2026-11-03", 0, 0, 0],
      ["2026-11-04", 0, 0, 0],
      ["2026-11-05", 1, 8_000, 2_000],
      ["2026-11-06", 0, 0, 0],
    ]);
  });

  it("drops the days outside the range", async () => {
    const range = DateRange.create("2026-11-01", "2026-11-30");
    const report = await new GetSalesReportUseCase(new FakeReportRepository(SPARSE_DAYS)).execute(range);

    expect(report.byDay).toHaveLength(30);
    expect(report.byDay.at(-1)?.date).toBe("2026-11-30");
    expect(report.byDay.some((day) => day.date === "2026-12-01")).toBe(false);
  });

  it("fills a period without any sale with zeros, crossing the end of a month", async () => {
    const range = DateRange.create("2026-02-27", "2026-03-02");
    const report = await new GetSalesReportUseCase(new FakeReportRepository([])).execute(range);

    expect(report.byDay.map((day) => day.date)).toEqual(["2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"]);
    expect(report.byDay.every((day) => day.salesCount === 0 && day.revenue.isZero())).toBe(true);
    expect(report.margin).toBeNull();
  });

  it("asks the repository for exactly the range it was given", async () => {
    const repository = new FakeReportRepository([]);
    const range = DateRange.day("2026-11-17");

    const report = await new GetSalesReportUseCase(repository).execute(range);

    expect(repository.asked).toEqual([range]);
    expect(report.byDay.map((day) => day.date)).toEqual(["2026-11-17"]);
  });
});
