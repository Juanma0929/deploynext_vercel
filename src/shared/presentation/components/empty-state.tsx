import type { ReactNode } from "react";

interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/**
 * What a list shows when it has nothing: a sentence that says why, instead of
 * an empty table that reads as a failure.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="font-medium">{title}</p>
      {description !== undefined && <p className="text-muted text-sm">{description}</p>}
      {action}
    </div>
  );
}
