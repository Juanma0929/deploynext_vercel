import { AppError } from "@/shared/domain/errors";

import type { CardIssues } from "./card-details";

/**
 * 409: the sale is no longer pending, already has a payment, or another
 * payment for it is in progress. A sale is charged only once.
 */
export class SaleNotChargeableError extends AppError {
  constructor() {
    super("Esta venta ya no se puede cobrar: ya tiene un pago, o ya no está pendiente.");
    this.name = "SaleNotChargeableError";
  }
}

/**
 * 502: Wompi failed or did not answer in time. The API changed nothing, so
 * the same request can be tried again. The message says what "nothing
 * changed" means for the call that failed.
 */
export class PaymentGatewayError extends AppError {
  constructor(message = "Wompi no respondió a tiempo. No se cobró nada: puedes intentarlo de nuevo.") {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

/**
 * 409 on GET /sales/:id/payment/status: the sale has no payment to check, so
 * it was never charged, or it is no longer pending.
 */
export class NoPaymentToCheckError extends AppError {
  constructor() {
    super("Esta venta no tiene un pago para verificar: ya fue cobrada o no está pendiente.");
    this.name = "NoPaymentToCheckError";
  }
}

/**
 * Wompi refused to tokenise the card (422): the data is not valid for it. The
 * issues say which field, when Wompi tells.
 */
export class CardRejectedError extends AppError {
  constructor(readonly issues: CardIssues = {}) {
    super("Wompi no aceptó los datos de la tarjeta. Revísalos e inténtalo de nuevo.");
    this.name = "CardRejectedError";
  }
}

/** Wompi could not be reached to tokenise the card. Nothing was charged. */
export class TokenizerUnavailableError extends AppError {
  constructor() {
    super("No se pudo conectar con Wompi para validar la tarjeta. No se cobró nada: inténtalo de nuevo.");
    this.name = "TokenizerUnavailableError";
  }
}

/** 404 (or 400 for an id that is not a UUID): the sale does not exist. */
export class PaymentSaleNotFoundError extends AppError {
  constructor() {
    super("La venta no existe.");
    this.name = "PaymentSaleNotFoundError";
  }
}
