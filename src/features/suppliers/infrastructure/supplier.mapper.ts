import { ApiRequestError } from "@/shared/infrastructure/http";

import { SupplierHasProductsError, SupplierNotFoundError } from "../domain/errors";
import { Supplier } from "../domain/supplier";
import type { NewSupplier, SupplierChanges } from "../domain/supplier-input";
import { SupplierProduct } from "../domain/supplier-product";
import type { SupplierProductDto } from "./dto/supplier-product.dto";
import type { CreateSupplierDto, UpdateSupplierDto } from "./dto/supplier-write.dto";
import type { SupplierDto } from "./dto/supplier.dto";

export function toSupplier(dto: SupplierDto): Supplier {
  return new Supplier({
    id: dto.id,
    name: dto.name,
    contactName: dto.contactName ?? null,
    phone: dto.phone ?? null,
    email: dto.email ?? null,
    address: dto.address ?? null,
  });
}

/** The purchase price stays out: the detail only shows what every role may see. */
export function toSupplierProduct(dto: SupplierProductDto): SupplierProduct {
  return new SupplierProduct({
    id: dto.id,
    name: dto.name,
    category: dto.category ?? null,
    salePrice: dto.salePrice,
    currentStock: dto.currentStock,
    minimumStock: dto.minimumStock,
    isActive: dto.isActive,
  });
}

/**
 * A 404 (no such supplier) and a 400 (ParseUUIDPipe refused the id) both mean
 * "this supplier does not exist". Anything else, including the redirect the
 * server client throws on a 401, goes through unchanged.
 */
export function toSupplierLookupError(error: unknown): unknown {
  if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
    return new SupplierNotFoundError();
  }
  return error;
}

/** On a write, a 400 means an invalid body (shown as is); only a 404 means it is gone. */
export function toSupplierWriteError(error: unknown): unknown {
  if (error instanceof ApiRequestError && error.status === 404) return new SupplierNotFoundError();
  return error;
}

/** Each key is copied only if present, so an empty field never reaches the API as "". */
export function toCreateSupplierDto(supplier: NewSupplier): CreateSupplierDto {
  return {
    name: supplier.name,
    ...(supplier.contactName !== undefined ? { contactName: supplier.contactName } : {}),
    ...(supplier.phone !== undefined ? { phone: supplier.phone } : {}),
    ...(supplier.email !== undefined ? { email: supplier.email } : {}),
    ...(supplier.address !== undefined ? { address: supplier.address } : {}),
  };
}

export function toUpdateSupplierDto(changes: SupplierChanges): UpdateSupplierDto {
  return {
    ...(changes.name !== undefined ? { name: changes.name } : {}),
    ...(changes.contactName !== undefined ? { contactName: changes.contactName } : {}),
    ...(changes.phone !== undefined ? { phone: changes.phone } : {}),
    ...(changes.email !== undefined ? { email: changes.email } : {}),
    ...(changes.address !== undefined ? { address: changes.address } : {}),
  };
}

/** DELETE answers 409 ("referenced by other records") while the supplier has products. */
export function toSupplierDeleteError(error: unknown): unknown {
  if (error instanceof ApiRequestError && error.status === 409) return new SupplierHasProductsError();
  return toSupplierWriteError(error);
}
