"use client";

import { useId, useState, type FormEvent } from "react";

import { lastDays, monthToDate, todayInColombia } from "@/shared/domain/calendar";
import { DateRange } from "@/shared/domain/date-range";
import { errorMessage } from "@/shared/domain/errors";
import {
  Button,
  EmptyState,
  Field,
  FilterChip,
  LoadingText,
  MoneyText,
  RetryAlert,
  Stat,
  StatGrid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@/shared/presentation/ui";

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
              <FilterChip
                key={option.id}
                label={option.label}
                isActive={preset === option.id}
                onSelect={() => choosePreset(option.id)}
              />
            ))}
          </fieldset>
          <CustomRangeForm range={range} isActive={preset === "custom"} onApply={applyCustom} />
        </div>
      </header>

      {sales.status === "loading" && <LoadingText>Cargando el reporte…</LoadingText>}

      {sales.status === "error" && <RetryAlert message={sales.message} onRetry={sales.reload} />}

      {sales.status === "ready" && <ReportBody report={sales.report} />}
    </section>
  );
}

function ReportBody({ report }: { readonly report: SalesReport }) {
  const margin = report.margin;

  return (
    <>
      <StatGrid>
        <Stat label="Ventas pagadas" value={report.salesCount} />
        <Stat label="Ingresos" value={<MoneyText value={report.revenue} />} />
        <Stat
          label="Ganancia"
          value={<MoneyText value={report.profit} highlightNegative />}
          {...(margin === null ? {} : { hint: `${PERCENT.format(margin)} % de los ingresos` })}
        />
      </StatGrid>

      {report.salesCount === 0 ? (
        <EmptyState>No hubo ventas pagadas en este periodo.</EmptyState>
      ) : (
        <>
          <SalesPeriodChart days={report.byDay} />
          <details className="text-sm">
            <summary className="text-primary cursor-pointer font-medium">Ver los datos día por día</summary>
            <Table caption="Ventas pagadas por día" className="mt-2">
              <TableHead>
                <TableHeaderCell>Día</TableHeaderCell>
                <TableHeaderCell align="right">Ventas</TableHeaderCell>
                <TableHeaderCell align="right">Ingresos</TableHeaderCell>
                <TableHeaderCell align="right">Ganancia</TableHeaderCell>
              </TableHead>
              <TableBody>
                {report.byDay.map((day) => (
                  <TableRow key={day.date} className={day.salesCount === 0 ? "text-muted" : undefined}>
                    <TableCell>{shortDay(day.date)}</TableCell>
                    <TableCell align="right" className="tabular-nums">
                      {day.salesCount}
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText value={day.revenue} />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText value={day.profit} highlightNegative />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

  const errorDescribedBy = error !== null ? ids.error : undefined;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <Field id={ids.from} label="Desde">
          <TextInput
            id={ids.from}
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            invalid={error !== null}
            aria-describedby={errorDescribedBy}
            className="py-1.5"
          />
        </Field>
        <Field id={ids.to} label="Hasta">
          <TextInput
            id={ids.to}
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            invalid={error !== null}
            aria-describedby={errorDescribedBy}
            className="py-1.5"
          />
        </Field>
        {/* Solid while the custom range is the one on screen. */}
        <Button type="submit" variant={isActive ? "primary" : "secondary"} className="py-1.5">
          Aplicar rango
        </Button>
      </div>
      {error !== null && (
        <p id={ids.error} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
