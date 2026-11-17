import type { ReactNode } from "react";

interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  /** The main action of the page, such as "Nuevo producto". */
  readonly action?: ReactNode;
}

/** The heading every section opens with, so they all look the same. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description !== undefined && (
          <p className="text-muted mt-1 text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
