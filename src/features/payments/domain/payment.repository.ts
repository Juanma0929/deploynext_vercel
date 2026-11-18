import type { PaymentRequest } from "./payment-request";
import type { PaymentStatusResult } from "./payment-status";

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

  /**
   * Asks Wompi, through the API, how the payment of a sale ended, and updates
   * the sale: approved makes it paid, declined makes it declined and gives the
   * stock back. Rejects with PaymentGatewayError (502), NoPaymentToCheckError
   * (409) or PaymentSaleNotFoundError (404).
   */
  checkStatus(saleId: string): Promise<PaymentStatusResult>;
}
