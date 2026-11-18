"use client";

import { useId, useState, type FormEvent } from "react";

import { lastDays, monthToDate, todayInColombia } from "@/shared/domain/calendar";
import { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";

import type { SalesReport } from "../domain/reports";
import { longDay, shortDay } from "./day-format";
import { DownloadSalesPdfButton } from "./download-sales-pdf-button";
import { SalesPeriodChart } from "./sales-period-chart";
import { useSalesReport } from "./use-sales-report";

type Preset = "today" | "week" | "month" | "custom";

const PRESETS: readonly { readonly id: Exclude<Preset, "custom">; readonly label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "7 días" },
  { id: "month", label: "Este mes" },
];

/** The days of a quick range, counted in Colombia whatever the time zone of the browser. */
function presetRange(preset: Exclude<Preset, "custom">, now: Date): DateRange {
  const today = todayInColombia(now);
  switch (preset) {
    case "today":
      return DateRange.day(today);
    case "week":
      return lastDays(today, 7);
    case "month":
      return monthToDate(today);
  }
}

const PERCENT = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/**
 * The paid sales of a period: quick ranges or a custom one, three cards with
 * the totals and a line chart day by day. Days are whole days in Colombia,
 * both ends included.
 */
export function SalesPeriodReport() {
  const [preset, setPreset] = useState<Preset>("week");
  const [range, setRange] = useState<DateRange>(() => presetRange("week", new Date()));
  const sales = useSalesReport(range);

  function choosePreset(next: Exclude<Preset, "custom">) {
    setPreset(next);
    setRange(presetRange(next, new Date()));
  }

  function applyCustom(next: DateRange) {
    setPreset("custom");
    setRange(next);
  }

  return (
    <section
      aria-labelledby="sales-period-title"
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="sales-period-title" className="text-lg font-semibold">
              Ventas por periodo
            </h2>
            <p className="text-muted text-sm">
              Del <span className="font-medium">{longDay(range.from)}</span>
              {range.from !== range.to && (
                <>
                  {" "}al <span className="font-medium">{longDay(range.to)}</span>
                </>
              )}
              , en hora de Colombia. Solo cuentan las ventas pagadas.
            </p>
          </div>
          <DownloadSalesPdfButton range={range} />
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <fieldset className="flex gap-2">
            <legend className="sr-only">Periodo</legend>
            {PRESETS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={preset === option.id}
                onClick={() => choosePreset(option.id)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  preset === option.id
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-slate-300 bg-white hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </fieldset>
          <CustomRangeForm range={range} isActive={preset === "custom"} onApply={applyCustom} />
        </div>
      </header>

      {sales.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando el reporte…
        </p>
      )}

      {sales.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{sales.message}</p>
          <button type="button" onClick={sales.reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {sales.status === "ready" && <ReportBody report={sales.report} />}
    </section>
  );
}

function ReportBody({ report }: { readonly report: SalesReport }) {
  const margin = report.margin;

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Ventas pagadas" value={String(report.salesCount)} />
        <Stat label="Ingresos" value={report.revenue.format()} />
        <Stat
          label="Ganancia"
          value={report.profit.format()}
          detail={margin === null ? undefined : `${PERCENT.format(margin)} % de los ingresos`}
          isNegative={report.profit.isNegative()}
        />
      </dl>

      {report.salesCount === 0 ? (
        <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
          No hubo ventas pagadas en este periodo.
        </p>
      ) : (
        <>
          <SalesPeriodChart days={report.byDay} />
          <details className="text-sm">
            <summary className="text-primary cursor-pointer font-medium">Ver los datos día por día</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left">
                <caption className="sr-only">Ventas pagadas por día</caption>
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Día</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Ventas</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Ingresos</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.byDay.map((day) => (
                    <tr key={day.date} className={day.salesCount === 0 ? "text-muted" : undefined}>
                      <td className="px-3 py-2">{shortDay(day.date)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{day.salesCount}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{day.revenue.format()}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{day.profit.format()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </>
  );
}

interface CustomRangeFormProps {
  readonly range: DateRange;
  readonly isActive: boolean;
  readonly onApply: (range: DateRange) => void;
}

/** A custom range, validated with DateRange before it is applied: real days and `from` ≤ `to`. */
function CustomRangeForm({ range, isActive, onApply }: CustomRangeFormProps) {
  const ids = { from: useId(), to: useId(), error: useId() };
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [error, setError] = useState<string | null>(null);

  // A quick range fills the custom fields, so they always start from what is shown.
  const [shown, setShown] = useState(range);
  if (shown !== range) {
    setShown(range);
    setFrom(range.from);
    setTo(range.to);
    setError(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onApply(DateRange.create(from, to));
      setError(null);
    } catch (rangeError: unknown) {
      setError(errorMessage(rangeError));
    }
  }

  const control =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.from} className="text-xs font-medium">Desde</label>
          <input
            id={ids.from}
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? ids.error : undefined}
            className={control}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.to} className="text-xs font-medium">Hasta</label>
          <input
            id={ids.to}
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? ids.error : undefined}
            className={control}
          />
        </div>
        <button
          type="submit"
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${
            isActive ? "bg-primary text-white" : "border border-slate-300 bg-white hover:bg-slate-100"
          }`}
        >
          Aplicar rango
        </button>
      </div>
      {error !== null && (
        <p id={ids.error} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

interface StatProps {
  readonly label: string;
  readonly value: string;
  readonly detail?: string | undefined;
  readonly isNegative?: boolean;
}

function Stat({ label, value, detail, isNegative = false }: StatProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold tabular-nums ${isNegative ? "text-red-700" : ""}`}>{value}</dd>
      {detail !== undefined && <dd className="text-muted text-xs">{detail}</dd>}
    </div>
  );
}
