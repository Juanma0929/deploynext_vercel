import { isUuid } from "@/shared/domain/uuid";

import { PaymentSaleNotFoundError } from "../domain/errors";
import type { PaymentRepository } from "../domain/payment.repository";
import type { PaymentStatusResult } from "../domain/payment-status";

/**
 * One check of how the payment of a sale is going. The polling (how often and
 * for how long) is PollPaymentStatusUseCase, which repeats this check.
 */
export class CheckPaymentStatusUseCase {
  constructor(private readonly repository: PaymentRepository) {}

  execute(saleId: string): Promise<PaymentStatusResult> {
    if (!isUuid(saleId)) return Promise.reject(new PaymentSaleNotFoundError());
    return this.repository.checkStatus(saleId);
  }
}
