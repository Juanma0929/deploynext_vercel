"use client";

import { useCallback } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { suppliersContainer } from "../di/container";
import { Supplier, type SupplierProps } from "../domain/supplier";
import type { SupplierFormValues } from "../domain/supplier-input";

export type SaveSupplierResult =
  | { readonly ok: true; readonly supplier: Supplier }
  | { readonly ok: false; readonly message: string };

/**
 * The facade of the supplier form: creates a supplier, or saves the changes
 * to `current`. It receives plain props because the edit page loads the
 * supplier on the server, and only plain data can reach a Client Component.
 */
export function useSaveSupplier(current: SupplierProps | undefined) {
  return useCallback(
    async (values: SupplierFormValues): Promise<SaveSupplierResult> => {
      const { createSupplier, updateSupplier } = suppliersContainer();
      try {
        const supplier =
          current === undefined
            ? await createSupplier.execute(values)
            : await updateSupplier.execute(new Supplier(current), values);
        return { ok: true, supplier };
      } catch (error: unknown) {
        return { ok: false, message: errorMessage(error) };
      }
    },
    [current],
  );
}
