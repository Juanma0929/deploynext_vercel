import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "./cn";

type Align = "left" | "right" | "center";
const ALIGN: Readonly<Record<Align, string>> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

interface TableProps {
  /** Read by screen readers only: what the table lists. */
  readonly caption: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * A table in a white box with a border, that scrolls sideways on a narrow
 * screen instead of breaking the page.
 */
export function Table({ caption, children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200 bg-white", className)}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { readonly children: ReactNode }) {
  return (
    <thead className="text-muted border-b border-slate-200 text-xs uppercase">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({
  align = "left",
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { readonly align?: Align }) {
  return <th scope="col" className={cn("px-4 py-3 font-medium", ALIGN[align], className)} {...rest} />;
}

export function TableBody({ children }: { readonly children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...rest} />;
}

export function TableCell({
  align = "left",
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { readonly align?: Align }) {
  return <td className={cn("px-4 py-3", ALIGN[align], className)} {...rest} />;
}

/** "—" for a value that is not there, read as "Sin dato". */
export function MissingValue({ children = "—" }: { readonly children?: ReactNode }) {
  return (
    <span className="text-slate-400" aria-label={children === "—" ? "Sin dato" : undefined}>
      {children}
    </span>
  );
}

/** What a list says when it has nothing to show. */
export function EmptyState({ children, className }: { readonly children: ReactNode; readonly className?: string }) {
  return (
    <p className={cn("text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm", className)}>
      {children}
    </p>
  );
}
