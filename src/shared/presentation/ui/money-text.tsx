import type { Money } from "@/shared/domain/money";

import { cn } from "./cn";

interface MoneyTextProps {
  readonly value: Money;
  /** Paint a negative amount in red, as a loss. Off by default. */
  readonly highlightNegative?: boolean;
  readonly className?: string;
}

/**
 * An amount of pesos, formatted for es-CO ("$ 12.500"). The digits have the
 * same width (tabular-nums), so amounts line up in a column.
 */
export function MoneyText({ value, highlightNegative = false, className }: MoneyTextProps) {
  return (
    <span className={cn("tabular-nums", highlightNegative && value.isNegative() && "text-red-700", className)}>
      {value.format()}
    </span>
  );
}
