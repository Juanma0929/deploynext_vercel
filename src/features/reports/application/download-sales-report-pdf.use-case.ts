import type { DateRange } from "@/shared/domain/date-range";
import { DomainError } from "@/shared/domain/errors";

import type { ReportRepository } from "../domain/report.repository";
import { salesReportFileName } from "../domain/reports";

export interface ReportFile {
  readonly content: Blob;
  /** Built here, not read from the Content-Disposition of the response. */
  readonly fileName: string;
}

/** The sales report of a period as a PDF, with the name it is saved under. */
export class DownloadSalesReportPdfUseCase {
  constructor(private readonly repository: ReportRepository) {}

  async execute(range: DateRange): Promise<ReportFile> {
    const content = await this.repository.salesReportPdf(range);
    if (content.size === 0) throw new DomainError("El servidor devolvió un PDF vacío. Intenta de nuevo.");
    return { content, fileName: salesReportFileName(range) };
  }
}
