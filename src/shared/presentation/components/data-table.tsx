import type { ReactNode } from "react";

import { cn } from "../cn";

export interface Column<T> {
  readonly key: string;
  readonly header: string;
  readonly cell: (row: T) => ReactNode;
  readonly align?: "left" | "right";
  /** Secondary data, hidden on a phone so the table still reads. */
  readonly hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  readonly columns: ReadonlyArray<Column<T>>;
  readonly rows: readonly T[];
  readonly getRowKey: (row: T) => string;
  /** What to show when there is nothing, instead of an empty frame. */
  readonly empty: ReactNode;
  readonly caption?: string;
}

/**
 * The table of the whole application, typed on the row it receives: a column
 * declares how to render a row and TypeScript checks it against that type, so
 * a renamed field breaks the build instead of printing "undefined".
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  caption,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="border-border bg-surface rounded-lg border p-6">{empty}</div>;
  }

  return (
    <div className="border-border bg-surface overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        {caption !== undefined && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-border text-muted border-b text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-2.5 font-medium",
                  column.align === "right" && "text-right",
                  column.hideOnMobile === true && "hidden sm:table-cell",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-border border-b last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-2.5 align-middle",
                    column.align === "right" && "text-right",
                    column.hideOnMobile === true && "hidden sm:table-cell",
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
