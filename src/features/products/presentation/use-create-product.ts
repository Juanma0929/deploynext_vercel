"use client";

import { useCallback } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { productsContainer } from "../di/container";
import { DuplicateBarcodeError, ProductSupplierNotFoundError } from "../domain/errors";
import { InvalidProductError, type ProductFormValues, type ProductIssues } from "../domain/product-input";

export type CreateProductResult =
  | { readonly ok: true; readonly productId: string }
  /** `issues` go next to their fields; `message`, if any, above the form. */
  | { readonly ok: false; readonly issues: ProductIssues; readonly message: string | null };

/**
 * The facade of the new product form. The errors that belong to a field are
 * returned as issues of that field: the rules of the entity, the 409 of a
 * barcode already taken and the 404 of a supplier that no longer exists.
 */
export function useCreateProduct() {
  return useCallback(async (values: ProductFormValues): Promise<CreateProductResult> => {
    try {
      const product = await productsContainer().createProduct.execute(values);
      return { ok: true, productId: product.id };
    } catch (error: unknown) {
      if (error instanceof InvalidProductError) {
        return { ok: false, issues: error.issues, message: null };
      }
      if (error instanceof DuplicateBarcodeError) {
        return { ok: false, issues: { barcode: error.message }, message: null };
      }
      if (error instanceof ProductSupplierNotFoundError) {
        return { ok: false, issues: { supplierId: error.message }, message: null };
      }
      return { ok: false, issues: {}, message: errorMessage(error) };
    }
  }, []);
}
