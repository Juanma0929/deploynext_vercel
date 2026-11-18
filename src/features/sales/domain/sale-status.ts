/**
 * The life of a sale in the API: it starts pending, the payment makes it paid
 * or declined, and an admin may cancel a pending one.
 */
export const SALE_STATUSES = ["pending", "paid", "declined", "cancelled"] as const;

export type SaleStatus = (typeof SALE_STATUSES)[number];

export function isSaleStatus(value: unknown): value is SaleStatus {
  return typeof value === "string" && (SALE_STATUSES as readonly string[]).includes(value);
}
