import { ApiRequestError } from "@/shared/infrastructure/http";

import {
  PaymentGatewayError,
  PaymentSaleNotFoundError,
  SaleNotChargeableError,
} from "../domain/errors";
import type { PaymentRequest } from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";
import type { ChargedSaleDto, CreateNequiPaymentDto } from "./dto/payment.dto";

export function toCreateNequiPaymentDto(request: PaymentRequest): CreateNequiPaymentDto {
  return {
    customerEmail: request.customerEmail,
    method: request.method,
    phoneNumber: request.phoneNumber,
  };
}

export function toStartedPayment(dto: ChargedSaleDto): StartedPayment {
  return {
    saleId: dto.id,
    saleStatus: dto.status,
    // The API always sets both on a successful charge; "" only if it ever did not.
    transactionId: dto.paymentTransactionId ?? "",
    method: dto.paymentMethod ?? "NEQUI",
  };
}

/**
 * 409: the sale cannot be charged (already paid, being paid, not pending);
 * 502: Wompi failed and nothing changed; 404 or 400: no such sale. A 403 (a
 * seller charging another seller's sale) stays as it is: the app shell
 * already warns about every 403.
 */
export function toChargeError(error: unknown): unknown {
  if (!(error instanceof ApiRequestError)) return error;
  if (error.status === 409) return new SaleNotChargeableError();
  if (error.status === 502) return new PaymentGatewayError();
  if (error.status === 404) return new PaymentSaleNotFoundError();
  return error;
}
