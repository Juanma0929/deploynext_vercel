"use client";

import { useState } from "react";

import type { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";
import { saveFile } from "@/shared/presentation/save-file";
import { Button } from "@/shared/presentation/ui";

import { reportsContainer } from "../di/container";

/** Downloads the PDF of the period on screen, named sales-report-<from>_<to>.pdf. */
export function DownloadSalesPdfButton({ range }: { readonly range: DateRange }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setIsDownloading(true);
    setError(null);
    try {
      const file = await reportsContainer().downloadSalesReportPdf.execute(range);
      saveFile(file.content, file.fileName);
    } catch (downloadError: unknown) {
      setError(errorMessage(downloadError));
    }
    setIsDownloading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        onClick={() => void download()}
        isLoading={isDownloading}
        loadingText="Generando PDF…"
      >
        Descargar PDF
      </Button>
      {error !== null && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
