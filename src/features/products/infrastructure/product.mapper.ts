import { ApiRequestError } from "@/shared/infrastructure/http";

import { DuplicateBarcodeError, ProductSupplierNotFoundError } from "../domain/errors";
import { Product } from "../domain/product";
import type { ProductDraft } from "../domain/product-input";
import type { SupplierName } from "../domain/product.repository";
import type { CreateProductDto, ProductDto, SupplierNameDto } from "./dto/product.dto";

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

/** 409: the barcode is taken; 404: the supplier does not exist. Anything else as is. */
export function toProductWriteError(error: unknown): unknown {
  if (!(error instanceof ApiRequestError)) return error;
  if (error.status === 409) return new DuplicateBarcodeError();
  if (error.status === 404) return new ProductSupplierNotFoundError();
  return error;
}
