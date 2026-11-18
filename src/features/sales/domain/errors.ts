import { AppError } from "@/shared/domain/errors";

/**
 * The API refused the sale because of the products: one is inactive, has
 * less stock than asked (409) or no longer exists (404). The message says
 * which, and the products should be loaded again.
 */
export class SaleRejectedError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "SaleRejectedError";
  }
}

/** The sale does not exist, or the id is not even a UUID. */
export class SaleNotFoundError extends AppError {
  constructor() {
    super("La venta no existe.");
    this.name = "SaleNotFoundError";
  }
}

/** A seller asked for a sale of another seller: the API answers 403. */
export class SaleNotYoursError extends AppError {
  constructor() {
    super("Esta venta no es tuya.");
    this.name = "SaleNotYoursError";
  }
}

/** The sale is no longer pending, or a payment started: it cannot be cancelled. */
export class SaleNotCancellableError extends AppError {
  constructor() {
    super("Esta venta ya no se puede cancelar: solo se cancelan las ventas pendientes sin un pago en curso.");
    this.name = "SaleNotCancellableError";
  }
}
