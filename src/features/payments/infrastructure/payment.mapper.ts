import {
  ConflictError,
  DomainError,
  GatewayError,
  NotFoundError,
  ValidationError,
} from "@/shared/domain/errors";

import {
  NoPaymentToCheckError,
  PaymentGatewayError,
  PaymentSaleNotFoundError,
  SaleNotChargeableError,
} from "../domain/errors";
import type { PaymentRequest } from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";
import { isSalePaymentStatus, type PaymentStatusResult } from "../domain/payment-status";
import type { ChargedSaleDto, CreatePaymentDto } from "./dto/payment.dto";

export function toPaymentStatus(dto: ChargedSaleDto): PaymentStatusResult {
  if (!isSalePaymentStatus(dto.status)) {
    throw new DomainError("El estado de la venta no es válido.");
  }
  return { status: dto.status, transactionId: dto.paymentTransactionId };
}

/**
 * On GET /sales/:id/payment/status: 502, Wompi did not answer and the sale did
 * not change; 409, the sale has no payment; 404 or 400, no such sale.
 */
export function toStatusError(error: unknown): unknown {
  if (error instanceof GatewayError) {
    return new PaymentGatewayError(
      "Wompi no respondió. La venta no cambió: puedes verificar el pago de nuevo.",
    );
  }
  if (error instanceof ConflictError) return new NoPaymentToCheckError();
  if (error instanceof NotFoundError || error instanceof ValidationError) return new PaymentSaleNotFoundError();
  return error;
}

export function toCreatePaymentDto(request: PaymentRequest): CreatePaymentDto {
  const { customerEmail, details } = request;
  return details.method === "NEQUI"
    ? { customerEmail, method: "NEQUI", phoneNumber: details.phoneNumber }
    : {
        customerEmail,
        method: "CARD",
        cardToken: details.cardToken,
        installments: details.installments,
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
  if (error instanceof ConflictError) return new SaleNotChargeableError();
  if (error instanceof GatewayError) return new PaymentGatewayError();
  if (error instanceof NotFoundError) return new PaymentSaleNotFoundError();
  return error;
}
