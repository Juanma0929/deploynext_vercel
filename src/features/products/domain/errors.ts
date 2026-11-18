import { AppError } from "@/shared/domain/errors";

/** The product does not exist, or the id is not even a UUID. */
export class ProductNotFoundError extends AppError {
  constructor() {
    super("El producto no existe.");
    this.name = "ProductNotFoundError";
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
