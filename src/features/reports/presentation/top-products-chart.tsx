"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type YAxisTickContentProps,
} from "recharts";

import type { TopProduct } from "../domain/reports";

/** One series, so one hue: the primary color (validated against the white surface). */
const BAR_COLOR = "var(--color-primary)";
const GRID_COLOR = "#e2e8f0";
const AXIS_TEXT_COLOR = "#64748b";

const BAR_THICKNESS = 20;
const ROW_HEIGHT = 36;
const AXIS_HEIGHT = 32;

/** The name axis takes less room on a phone, so the bars keep most of the width. */
const NARROW_WIDTH = 480;
const NAME_AXIS = {
  wide: { width: 176, maxChars: 26 },
  narrow: { width: 112, maxChars: 15 },
} as const;

interface ChartDatum {
  readonly name: string;
  readonly quantitySold: number;
  readonly revenue: string;
}

interface TopProductsChartProps {
  readonly products: readonly TopProduct[];
}

/**
 * Ranked horizontal bars of the units sold, largest first. Horizontal because
 * product names are long; one hue because there is one measure. Revenue and
 * profit live in the table next to it, not on a second axis.
 */
export function TopProductsChart({ products }: TopProductsChartProps) {
  const data: ChartDatum[] = products.map((product) => ({
    name: product.name,
    quantitySold: product.quantitySold,
    revenue: product.revenue.format(),
  }));
  const height = data.length * ROW_HEIGHT + AXIS_HEIGHT;
  const { ref, width } = useWidth<HTMLDivElement>();
  const nameAxis = width !== null && width < NARROW_WIDTH ? NAME_AXIS.narrow : NAME_AXIS.wide;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-medium">Unidades vendidas por producto</figcaption>
      <div ref={ref} style={{ height }} role="img" aria-label={describe(products)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} strokeWidth={1} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
              axisLine={{ stroke: GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={nameAxis.width}
              tick={(props: YAxisTickContentProps) => (
                <ProductNameTick {...props} maxChars={nameAxis.maxChars} />
              )}
              axisLine={{ stroke: GRID_COLOR }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
              content={(props) => <BarTooltip {...props} />}
            />
            <Bar
              dataKey="quantitySold"
              fill={BAR_COLOR}
              barSize={BAR_THICKNESS}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="quantitySold"
                position="right"
                fill="var(--color-foreground)"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** Values lead, labels follow; the text uses text colors, never the bar color. */
function BarTooltip({ active, payload }: TooltipContentProps) {
  const datum = payload?.[0]?.payload as ChartDatum | undefined;
  if (!active || datum === undefined) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{datum.name}</p>
      <p>
        <strong className="tabular-nums">{datum.quantitySold}</strong>{" "}
        <span className="text-muted">{datum.quantitySold === 1 ? "unidad vendida" : "unidades vendidas"}</span>
      </p>
      <p>
        <strong className="tabular-nums">{datum.revenue}</strong> <span className="text-muted">en ventas</span>
      </p>
    </div>
  );
}

/**
 * One line per product, cut with "…" when it does not fit; the full name is
 * in the tooltip and in the table. Recharts would otherwise wrap it in two.
 */
function ProductNameTick({ x, y, payload, maxChars }: YAxisTickContentProps & { readonly maxChars: number }) {
  const name = String(payload.value);
  const label = name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name;
  return (
    <text x={x} y={y} dx={-6} dy={4} textAnchor="end" fill={AXIS_TEXT_COLOR} fontSize={12}>
      <title>{name}</title>
      {label}
    </text>
  );
}

/** The rendered width of an element, kept up to date as it resizes. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

/** The chart in words, for screen readers; the table carries every value too. */
function describe(products: readonly TopProduct[]): string {
  const top = products[0];
  if (top === undefined) return "Sin ventas pagadas.";
  return `Gráfico de barras de ${products.length} productos por unidades vendidas. El más vendido es ${top.name}, con ${top.quantitySold} unidades.`;
}
