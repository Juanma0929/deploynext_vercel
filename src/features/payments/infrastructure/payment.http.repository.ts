import type { HttpClient } from "@/shared/infrastructure/http";

import type { PaymentRequest } from "../domain/payment-request";
import type { PaymentRepository, StartedPayment } from "../domain/payment.repository";
import type { ChargedSaleDto } from "./dto/payment.dto";
import type { PaymentStatusResult } from "../domain/payment-status";
import {
  toChargeError,
  toCreatePaymentDto,
  toPaymentStatus,
  toStartedPayment,
  toStatusError,
} from "./payment.mapper";

/**
 * Charges through our API, with the shared client and the JWT of the user:
 * the backend talks to Wompi with the private key. This is not the
 * WompiCardTokenizer, which only tokenises cards with the public key.
 */
export class PaymentHttpRepository implements PaymentRepository {
  constructor(private readonly http: HttpClient) {}

  async charge(saleId: string, request: PaymentRequest): Promise<StartedPayment> {
    try {
      const path = `/sales/${encodeURIComponent(saleId)}/payment`;
      const sale = await this.http.post<ChargedSaleDto>(path, toCreatePaymentDto(request));
      return toStartedPayment(sale);
    } catch (error: unknown) {
      throw toChargeError(error);
    }
  }

  async checkStatus(saleId: string): Promise<PaymentStatusResult> {
    try {
      const path = `/sales/${encodeURIComponent(saleId)}/payment/status`;
      return toPaymentStatus(await this.http.get<ChargedSaleDto>(path));
    } catch (error: unknown) {
      throw toStatusError(error);
    }
  }
}
