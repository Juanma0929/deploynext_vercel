import { AppError } from "@/shared/domain/errors";

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
 * the same charge can be tried again.
 */
export class PaymentGatewayError extends AppError {
  constructor() {
    super("Wompi no respondió a tiempo. No se cobró nada: puedes intentarlo de nuevo.");
    this.name = "PaymentGatewayError";
  }
}

/** 404 (or 400 for an id that is not a UUID): the sale does not exist. */
export class PaymentSaleNotFoundError extends AppError {
  constructor() {
    super("La venta que intentas cobrar no existe.");
    this.name = "PaymentSaleNotFoundError";
  }
}
