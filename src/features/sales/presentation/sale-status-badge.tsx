import type { SaleStatus } from "../domain/sale-status";
import { SALE_STATUS_LABELS } from "./sale-status-labels";

const TONES: Readonly<Record<SaleStatus, string>> = {
  pending: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  declined: "bg-red-100 text-red-900",
  cancelled: "bg-slate-200 text-slate-700",
};

export function SaleStatusBadge({ status }: { readonly status: SaleStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONES[status]}`}>
      {SALE_STATUS_LABELS[status]}
    </span>
  );
}
