/**
 * What becomes of a sale once it has a payment. It starts pending; Wompi makes
 * it paid or declined (and a declined sale got its stock back). Cancelled only
 * happens before a payment, but the API may still answer it.
 */
export const SALE_PAYMENT_STATUSES = ["pending", "paid", "declined", "cancelled"] as const;
export type SalePaymentStatus = (typeof SALE_PAYMENT_STATUSES)[number];

export function isSalePaymentStatus(value: unknown): value is SalePaymentStatus {
  return typeof value === "string" && (SALE_PAYMENT_STATUSES as readonly string[]).includes(value);
}

/** Anything but pending is final: asking again will not change it. */
export function isFinalStatus(status: SalePaymentStatus): boolean {
  return status !== "pending";
}

/** What GET /sales/:id/payment/status answers. */
export interface PaymentStatusResult {
  readonly status: SalePaymentStatus;
  readonly transactionId: string | null;
}

/**
 * How long to keep asking while the payment is pending. Nequi waits for the
 * customer to accept on the phone, so a few seconds between checks is enough,
 * and a minute covers a normal answer without hammering the API.
 */
export const PAYMENT_POLLING = {
  intervalMs: 2_500,
  maxDurationMs: 60_000,
} as const;
