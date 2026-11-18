import { Badge, type Tone } from "@/shared/presentation/ui";

import type { SaleStatus } from "../domain/sale-status";
import { SALE_STATUS_LABELS } from "./sale-status-labels";

/**
 * One color per status, from the tones of the UI kit: pending waits (warning),
 * paid is done (success), declined is a problem (danger), cancelled is over
 * (neutral). Record<SaleStatus, …> makes a new status fail to compile until it
 * gets its color.
 */
export const SALE_STATUS_TONES: Readonly<Record<SaleStatus, Tone>> = {
  pending: "warning",
  paid: "success",
  declined: "danger",
  cancelled: "neutral",
};

export function SaleStatusBadge({ status }: { readonly status: SaleStatus }) {
  return <Badge tone={SALE_STATUS_TONES[status]}>{SALE_STATUS_LABELS[status]}</Badge>;
}
