import { AppError } from "@/shared/domain/errors";

/** The product does not exist, or the id is not even a UUID. */
export class ProductNotFoundError extends AppError {
  constructor() {
    super("El producto no existe.");
    this.name = "ProductNotFoundError";
  }
}
