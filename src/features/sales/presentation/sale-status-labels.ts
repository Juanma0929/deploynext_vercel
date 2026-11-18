import type { SaleStatus } from "../domain/sale-status";

/** How each status is named in the interface. */
export const SALE_STATUS_LABELS: Readonly<Record<SaleStatus, string>> = {
  pending: "Pendiente",
  paid: "Pagada",
  declined: "Rechazada",
  cancelled: "Cancelada",
};

/** The same, in plural, for the filter. */
export const SALE_STATUS_PLURALS: Readonly<Record<SaleStatus, string>> = {
  pending: "Pendientes",
  paid: "Pagadas",
  declined: "Rechazadas",
  cancelled: "Canceladas",
};
