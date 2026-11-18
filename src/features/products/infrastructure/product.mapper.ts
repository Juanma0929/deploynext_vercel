import { ConflictError, NotFoundError, ValidationError } from "@/shared/domain/errors";

import {
  DuplicateBarcodeError,
  ProductHasSalesError,
  ProductNotFoundError,
  ProductSupplierNotFoundError,
} from "../domain/errors";
import { Product } from "../domain/product";
import type { ProductChanges, ProductDraft } from "../domain/product-input";
import type { SupplierName } from "../domain/product.repository";
import type {
  CreateProductDto,
  ProductDto,
  SupplierNameDto,
  UpdateProductDto,
} from "./dto/product.dto";

export function toProduct(dto: ProductDto): Product {
  return new Product({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    barcode: dto.barcode,
    purchasePrice: dto.purchasePrice,
    salePrice: dto.salePrice,
    currentStock: dto.currentStock,
    minimumStock: dto.minimumStock,
    supplierId: dto.supplierId,
    isActive: dto.isActive,
  });
}

export function toSupplierName(dto: SupplierNameDto): SupplierName {
  return { id: dto.id, name: dto.name };
}

/**
 * The body of POST /products. The form keeps the amounts as text, and the API
 * answers 400 to "2900" as a string, so here they become numbers. An empty
 * optional field is left out instead of being sent as null or "".
 */
export function toCreateProductDto(draft: ProductDraft): CreateProductDto {
  return {
    name: draft.name,
    ...(draft.description !== null ? { description: draft.description } : {}),
    ...(draft.category !== null ? { category: draft.category } : {}),
    ...(draft.barcode !== null ? { barcode: draft.barcode } : {}),
    purchasePrice: Number(draft.purchasePrice),
    salePrice: Number(draft.salePrice),
    currentStock: Number(draft.currentStock),
    minimumStock: Number(draft.minimumStock),
    supplierId: draft.supplierId,
  };
}

/**
 * The body of PATCH /products/:id. Like on create, the amounts become numbers
 * here; every key is copied only if it changed, so the API leaves the rest
 * alone.
 */
export function toUpdateProductDto(changes: ProductChanges): UpdateProductDto {
  const amount = (value: string | undefined) => (value === undefined ? undefined : Number(value));
  const dto = {
    name: changes.name,
    description: changes.description,
    category: changes.category,
    barcode: changes.barcode,
    purchasePrice: amount(changes.purchasePrice),
    salePrice: amount(changes.salePrice),
    currentStock: amount(changes.currentStock),
    minimumStock: amount(changes.minimumStock),
    supplierId: changes.supplierId,
    isActive: changes.isActive,
  };
  // An undefined key would be dropped by JSON anyway; leaving it out keeps the body honest.
  return Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== undefined),
  ) as UpdateProductDto;
}

/** On create: 409, the barcode is taken; 404, the supplier does not exist. Anything else as is. */
export function toProductWriteError(error: unknown): unknown {
  if (error instanceof ConflictError) return new DuplicateBarcodeError();
  if (error instanceof NotFoundError) return new ProductSupplierNotFoundError();
  return error;
}

/** On delete: 409, sales reference the product; 404, it is already gone. */
export function toProductDeleteError(error: unknown): unknown {
  if (error instanceof ConflictError) return new ProductHasSalesError();
  if (error instanceof NotFoundError || error instanceof ValidationError) return new ProductNotFoundError();
  return error;
}

/**
 * On update a 404 is either the product or the new supplier. If the supplier
 * was being changed, it is read as the supplier; otherwise, as the product.
 */
export function toProductUpdateError(error: unknown, changes: ProductChanges): unknown {
  if (error instanceof ConflictError) return new DuplicateBarcodeError();
  if (error instanceof NotFoundError) {
    return changes.supplierId !== undefined
      ? new ProductSupplierNotFoundError()
      : new ProductNotFoundError();
  }
  return error;
}
