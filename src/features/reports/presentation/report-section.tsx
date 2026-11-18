import type { ReactNode } from "react";

interface ReportSectionProps {
  readonly titleId: string;
  readonly title: string;
  readonly description: string;
  /** On the right of the title: "Actualizar", "Descargar PDF". */
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

/** One report of the reports page: a white box with its title, what it shows and its actions. */
export function ReportSection({ titleId, title, description, actions, children }: ReportSectionProps) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p className="text-muted text-sm">{description}</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
