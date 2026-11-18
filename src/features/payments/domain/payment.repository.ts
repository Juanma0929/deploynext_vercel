import type { PaymentRequest } from "./payment-request";

/**
 * What the API answers after starting a charge: the sale stays pending until
 * the customer accepts or rejects it, and from now on it has a transaction.
 */
export interface StartedPayment {
  readonly saleId: string;
  /** Still "pending": the result comes later, from GET /sales/:id/payment/status. */
  readonly saleStatus: string;
  readonly transactionId: string;
  readonly method: string;
}

export interface PaymentRepository {
  /**
   * Starts the charge of a sale with Wompi. Rejects with SaleNotChargeableError
   * (409), PaymentGatewayError (502) or PaymentSaleNotFoundError (404).
   */
  charge(saleId: string, request: PaymentRequest): Promise<StartedPayment>;
}
