import { isUuid } from "@/shared/domain/uuid";

import { PaymentSaleNotFoundError } from "../domain/errors";
import { PaymentRequest, type NequiPaymentValues } from "../domain/payment-request";
import type { PaymentRepository, StartedPayment } from "../domain/payment.repository";

/**
 * Charges a sale with Nequi: Wompi sends a push to the customer's phone and the
 * sale stays pending until it is accepted or rejected there. A request that
 * breaks a rule (InvalidPaymentRequestError) never reaches the API.
 */
export class ChargeWithNequiUseCase {
  constructor(private readonly repository: PaymentRepository) {}

  async execute(saleId: string, values: NequiPaymentValues): Promise<StartedPayment> {
    if (!isUuid(saleId)) throw new PaymentSaleNotFoundError();
    return this.repository.charge(saleId, PaymentRequest.nequi(values));
  }
}
