import { AppError } from "@/shared/domain/errors";

/** The supplier does not exist, or the id is not even a UUID. */
export class SupplierNotFoundError extends AppError {
  constructor() {
    super("El proveedor no existe.");
    this.name = "SupplierNotFoundError";
  }
}
