"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import type { DailySales } from "../domain/reports";
import { longDay, shortDay } from "./day-format";

/**
 * Two series in the same unit (pesos), so one shared axis. Slots 1 and 2 of
 * the categorical palette, validated as a pair against the white surface.
 * The number of sales is another unit: it lives in its card and the tooltip.
 */
const SERIES = {
  revenue: { label: "Ingresos", color: "#2a78d6" },
  profit: { label: "Ganancia", color: "#eb6834" },
} as const;

const GRID_COLOR = "#e2e8f0";
const AXIS_TEXT_COLOR = "#64748b";
/** Few points get a marker on each one; many points only on hover. */
const MAX_POINTS_WITH_MARKERS = 14;

const PESOS = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const COMPACT = new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 });

interface ChartDatum {
  readonly date: string;
  readonly revenue: number;
  readonly profit: number;
  readonly salesCount: number;
}

interface SalesPeriodChartProps {
  readonly days: readonly DailySales[];
}

/** Revenue and profit day by day. The days without sales are already 0. */
export function SalesPeriodChart({ days }: SalesPeriodChartProps) {
  const data: ChartDatum[] = days.map((day) => ({
    date: day.date,
    revenue: day.revenue.amount,
    profit: day.profit.amount,
    salesCount: day.salesCount,
  }));
  const withMarkers = data.length <= MAX_POINTS_WITH_MARKERS;
  const lastIndex = data.length - 1;

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-sm font-medium">Ingresos y ganancia por día</figcaption>
        <ul className="flex gap-4 text-xs" aria-label="Leyenda">
          {Object.values(SERIES).map((series) => (
            <li key={series.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded" style={{ background: series.color }} />
              {series.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="h-72" role="img" aria-label={describe(data)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 72, bottom: 4, left: 4 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeWidth={1} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              width={64}
              tickFormatter={(value: number) => `$ ${COMPACT.format(value)}`}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: AXIS_TEXT_COLOR, strokeWidth: 1 }}
              content={(props) => <DayTooltip {...props} />}
            />
            {(["revenue", "profit"] as const).map((key) => (
              <Line
                key={key}
                type="linear"
                dataKey={key}
                name={SERIES[key].label}
                stroke={SERIES[key].color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={withMarkers ? { r: 4, fill: SERIES[key].color, strokeWidth: 0 } : false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                isAnimationActive={false}
                label={(props: {
                  index?: number | undefined;
                  x?: number | string | undefined;
                  y?: number | string | undefined;
                }) =>
                  props.index === lastIndex ? (
                    <EndLabel
                      x={Number(props.x)}
                      y={Number(props.y)}
                      text={SERIES[key].label}
                      // Profit is revenue minus cost, so it is never above revenue: label it below.
                      dy={key === "revenue" ? -8 : 16}
                    />
                  ) : (
                    <g />
                  )
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** The name of the series at the end of its line, in text color (never the series color). */
function EndLabel({ x, y, text, dy }: { readonly x: number; readonly y: number; readonly text: string; readonly dy: number }) {
  return (
    <text x={x + 8} y={y} dy={dy} fill="var(--color-foreground)" fontSize={12}>
      {text}
    </text>
  );
}

/** The day, then every series: values lead, labels follow, keyed by a short line. */
function DayTooltip({ active, payload }: TooltipContentProps) {
  const datum = payload?.[0]?.payload as ChartDatum | undefined;
  if (!active || datum === undefined) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium first-letter:uppercase">{longDay(datum.date)}</p>
      {(["revenue", "profit"] as const).map((key) => (
        <p key={key} className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES[key].color }} />
          <strong className="tabular-nums">{PESOS.format(datum[key])}</strong>
          <span className="text-muted">{SERIES[key].label.toLowerCase()}</span>
        </p>
      ))}
      <p className="text-muted mt-1">
        {datum.salesCount} {datum.salesCount === 1 ? "venta pagada" : "ventas pagadas"}
      </p>
    </div>
  );
}

function describe(data: readonly ChartDatum[]): string {
  const best = data.reduce<ChartDatum | null>((top, day) => (top === null || day.revenue > top.revenue ? day : top), null);
  if (best === null || best.revenue === 0) return "Gráfico de líneas: no hubo ventas pagadas en el periodo.";
  return `Gráfico de líneas de ingresos y ganancia por día, ${data.length} días. El día de más ingresos fue ${longDay(best.date)}, con ${PESOS.format(best.revenue)}.`;
}
