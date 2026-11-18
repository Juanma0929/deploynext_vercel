import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { cn } from "./cn";

interface PageHeaderProps {
  /** The id of the <h1>, for the aria-labelledby of the section. */
  readonly titleId: string;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  /** Buttons or links on the right, such as "Nuevo producto". */
  readonly actions?: ReactNode;
}

/** The title of a screen, what it is for, and its main actions. */
export function PageHeader({ titleId, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 id={titleId} className="text-2xl font-semibold">
          {title}
        </h1>
        {description !== undefined && <div className="text-muted text-sm">{description}</div>}
      </div>
      {actions}
    </header>
  );
}

export interface Crumb {
  readonly label: string;
  /** Without href, it is the current page. */
  readonly href?: string;
}

/** "Productos / Leche": where the page is, with a link back to each level. */
export function Breadcrumbs({ items }: { readonly items: readonly Crumb[] }) {
  return (
    <nav aria-label="Ruta" className="text-muted text-sm">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <span aria-hidden="true"> / </span>}
          {item.href !== undefined ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/** A grid of figures. Put Stat inside. */
export function StatGrid({ children, className }: { readonly children: ReactNode; readonly className?: string }) {
  return <dl className={cn("grid gap-3 sm:grid-cols-3", className)}>{children}</dl>;
}

interface StatProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly hint?: string;
  readonly className?: string;
}

/** One figure of a StatGrid: "Ventas · 12". */
export function Stat({ label, value, hint, className }: StatProps) {
  return (
    <div className={cn("rounded-lg bg-white p-4 shadow-sm", className)}>
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
      {hint !== undefined && <dd className="text-muted mt-1 text-xs">{hint}</dd>}
    </div>
  );
}

/** A white box with a title, for a block of a screen. */
export function Panel({
  title,
  titleId,
  children,
  className,
}: {
  readonly title: ReactNode;
  readonly titleId?: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4", className)}
    >
      <h2 id={titleId} className="font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface StatusPageProps {
  /** "403", "404": decorative, the title says it in words. */
  readonly code?: string;
  readonly titleId: string;
  readonly title: string;
  readonly children: ReactNode;
  /** The way out: "Volver al inicio", "Reintentar". */
  readonly action?: ReactNode;
  readonly role?: "alert";
}

/** A page that replaces the content: not found, access denied, an error. */
export function StatusPage({ code, titleId, title, children, action, role }: StatusPageProps) {
  return (
    <section
      aria-labelledby={titleId}
      role={role}
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      {code !== undefined && (
        <p className="text-5xl font-bold text-slate-300" aria-hidden="true">
          {code}
        </p>
      )}
      <h1 id={titleId} className="text-xl font-semibold">
        {title}
      </h1>
      <div className="text-muted text-sm">{children}</div>
      {action !== undefined && <div className="mt-2">{action}</div>}
    </section>
  );
}

/** A label and its value in a list of data: <dl><DataItem …/></dl>. */
export function DataItem({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted text-xs uppercase">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
