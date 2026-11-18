import { AppError } from "@/shared/domain/errors";

/** The product does not exist, or the id is not even a UUID. */
export class ProductNotFoundError extends AppError {
  constructor() {
    super("El producto no existe.");
    this.name = "ProductNotFoundError";
  }
}

/**
 * DELETE /products/:id answered 409: sales reference the product, so it cannot
 * be deleted without breaking their history. It can be deactivated instead.
 */
export class ProductHasSalesError extends AppError {
  constructor() {
    super("Este producto ya se vendió, así que no se puede eliminar.");
    this.name = "ProductHasSalesError";
  }
}

/** 409 on a write: another product already has this barcode. */
export class DuplicateBarcodeError extends AppError {
  constructor() {
    super("Ya existe un producto con este código de barras.");
    this.name = "DuplicateBarcodeError";
  }
}

/** 404 on a write: the chosen supplier does not exist (it was probably just deleted). */
export class ProductSupplierNotFoundError extends AppError {
  constructor() {
    super("El proveedor elegido ya no existe. Elige otro.");
    this.name = "ProductSupplierNotFoundError";
  }
}
