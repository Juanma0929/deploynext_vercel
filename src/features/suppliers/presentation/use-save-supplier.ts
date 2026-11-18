"use client";

import { useCallback } from "react";

import { notifyDataChanged } from "@/shared/presentation/data-changes";
import { formErrorsFrom } from "@/shared/presentation/form-errors";

import { suppliersContainer } from "../di/container";
import { Supplier, type SupplierProps } from "../domain/supplier";
import type { SupplierFormValues } from "../domain/supplier-input";
import type { SupplierFormField } from "./supplier-schema";

export type SaveSupplierResult =
  | { readonly ok: true; readonly supplier: Supplier }
  /** `fieldErrors` go next to their fields (a 400 of the API); `message`, if any, above the form. */
  | {
      readonly ok: false;
      readonly fieldErrors: Partial<Record<SupplierFormField, string>>;
      readonly message: string | null;
    };

const SUPPLIER_FIELDS: readonly SupplierFormField[] = ["name", "contactName", "phone", "email", "address"];

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
        // The cached catalog of suppliers is stale now.
        notifyDataChanged("suppliers");
        return { ok: true, supplier };
      } catch (error: unknown) {
        const { fields, message } = formErrorsFrom(error, SUPPLIER_FIELDS);
        return { ok: false, fieldErrors: fields, message };
      }
    },
    [current],
  );
}
