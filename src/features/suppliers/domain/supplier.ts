import { DomainError } from "@/shared/domain/errors";

export interface SupplierProps {
  readonly id: string;
  readonly name: string;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
}

/**
 * A company that supplies products to the business. Only the name is
 * required; an empty contact field is kept as null, never as "".
 */
export class Supplier {
  readonly id: string;
  readonly name: string;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;

  constructor(props: SupplierProps) {
    const name = props.name.trim();
    if (name === "") throw new DomainError("El nombre del proveedor es obligatorio.");

    this.id = props.id;
    this.name = name;
    this.contactName = optional(props.contactName);
    this.phone = optional(props.phone);
    this.email = optional(props.email);
    this.address = optional(props.address);
  }
}

function optional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
