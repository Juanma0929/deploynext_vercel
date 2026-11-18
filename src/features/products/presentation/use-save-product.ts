"use client";

import { useCallback } from "react";

import { notifyDataChanged } from "@/shared/presentation/data-changes";
import { formErrorsFrom } from "@/shared/presentation/form-errors";

import { productsContainer } from "../di/container";
import { DuplicateBarcodeError, ProductSupplierNotFoundError } from "../domain/errors";
import { Product, type ProductProps } from "../domain/product";
import {
  InvalidProductError,
  type ProductField,
  type ProductFormValues,
  type ProductIssues,
} from "../domain/product-input";

export type SaveProductResult =
  | { readonly ok: true; readonly productId: string }
  /** `issues` go next to their fields; `message`, if any, above the form. */
  | { readonly ok: false; readonly issues: ProductIssues; readonly message: string | null };

/**
 * The facade of the product form: creates a product, or saves only what
 * changed in `current`. It receives plain props because the edit page loads
 * the product on the server, and only plain data can reach a Client Component.
 *
 * The errors that belong to a field are returned as issues of that field: the
 * rules of the entity, the 409 of a barcode already taken and the 404 of a
 * supplier that no longer exists.
 */
export function useSaveProduct(current: ProductProps | undefined) {
  return useCallback(
    async (values: ProductFormValues): Promise<SaveProductResult> => {
      const { createProduct, updateProduct } = productsContainer();
      try {
        const product =
          current === undefined
            ? await createProduct.execute(values)
            : await updateProduct.execute(new Product(current), values);
        // The cached catalog of products is stale now.
        notifyDataChanged("products");
        return { ok: true, productId: product.id };
      } catch (error: unknown) {
        return toFailure(error);
      }
    },
    [current],
  );
}

export function toFailure(error: unknown): Extract<SaveProductResult, { ok: false }> {
  if (error instanceof InvalidProductError) {
    return { ok: false, issues: error.issues, message: null };
  }
  if (error instanceof DuplicateBarcodeError) {
    return { ok: false, issues: { barcode: error.message }, message: null };
  }
  if (error instanceof ProductSupplierNotFoundError) {
    return { ok: false, issues: { supplierId: error.message }, message: null };
  }
  // A 400 of the API: each message next to its field; anything else above the form.
  const { fields, message } = formErrorsFrom(error, PRODUCT_FIELDS);
  return { ok: false, issues: fields, message };
}

const PRODUCT_FIELDS: readonly ProductField[] = [
  "name",
  "description",
  "category",
  "barcode",
  "purchasePrice",
  "salePrice",
  "currentStock",
  "minimumStock",
  "supplierId",
];
