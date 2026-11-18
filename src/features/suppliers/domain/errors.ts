import { AppError } from "@/shared/domain/errors";

/** The supplier does not exist, or the id is not even a UUID. */
export class SupplierNotFoundError extends AppError {
  constructor() {
    super("El proveedor no existe.");
    this.name = "SupplierNotFoundError";
  }
}

/**
 * DELETE /suppliers/:id answered 409: products still reference the supplier,
 * inactive ones included, so it cannot be deleted.
 */
export class SupplierHasProductsError extends AppError {
  constructor() {
    super("Este proveedor tiene productos asociados.");
    this.name = "SupplierHasProductsError";
  }
}
