"use client";

import { useState } from "react";

import type { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";
import { saveFile } from "@/shared/presentation/save-file";

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
      <button
        type="button"
        onClick={() => void download()}
        disabled={isDownloading}
        aria-busy={isDownloading}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60"
      >
        {isDownloading ? "Generando PDF…" : "Descargar PDF"}
      </button>
      {error !== null && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
