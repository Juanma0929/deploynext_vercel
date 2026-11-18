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
