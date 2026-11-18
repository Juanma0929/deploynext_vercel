import { isValidEmail } from "@/shared/domain/email";
import { DomainError } from "@/shared/domain/errors";

import type { Supplier } from "./supplier";

/** The optional fields of a supplier: an empty one is null in the API. */
export const OPTIONAL_SUPPLIER_FIELDS = ["contactName", "phone", "email", "address"] as const;
type OptionalField = (typeof OPTIONAL_SUPPLIER_FIELDS)[number];

/** What the form holds: every field as typed, "" when empty. */
export interface SupplierFormValues {
  readonly name: string;
  readonly contactName: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
}

/** What POST /suppliers receives. An empty field is left out, so it stays null. */
export type NewSupplier = { readonly name: string } & {
  readonly [K in OptionalField]?: string;
};

/**
 * What PATCH /suppliers/:id receives: only what changed. null empties a field
 * that had a value; the API accepts it because the fields are @IsOptional().
 */
export type SupplierChanges = { readonly name?: string } & {
  readonly [K in OptionalField]?: string | null;
};

/** Only name is required; the email, if written, must be valid. */
export function assertValidSupplier(values: SupplierFormValues): void {
  if (values.name.trim() === "") throw new DomainError("El nombre del proveedor es obligatorio.");

  const email = values.email.trim();
  if (email !== "" && !isValidEmail(email)) throw new DomainError("Ingresa un correo válido.");
}

export function toNewSupplier(values: SupplierFormValues): NewSupplier {
  const supplier: { name: string } & { [K in OptionalField]?: string } = {
    name: values.name.trim(),
  };
  for (const field of OPTIONAL_SUPPLIER_FIELDS) {
    const value = values[field].trim();
    if (value !== "") supplier[field] = value;
  }
  return supplier;
}

/**
 * The fields that differ from the saved supplier. A field left empty that
 * was already empty is not sent; one that had a value and was emptied is
 * sent as null, or the API would keep the old value.
 */
export function changesBetween(current: Supplier, values: SupplierFormValues): SupplierChanges {
  const changes: { name?: string } & { [K in OptionalField]?: string | null } = {};

  const name = values.name.trim();
  if (name !== current.name) changes.name = name;

  for (const field of OPTIONAL_SUPPLIER_FIELDS) {
    const trimmed = values[field].trim();
    const value = trimmed === "" ? null : trimmed;
    if (value !== current[field]) changes[field] = value;
  }
  return changes;
}

export function hasSupplierChanges(changes: SupplierChanges): boolean {
  return Object.keys(changes).length > 0;
}
