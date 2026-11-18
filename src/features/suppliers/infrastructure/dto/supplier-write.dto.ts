/** Body of POST /suppliers. Absent fields are stored as null. */
export interface CreateSupplierDto {
  readonly name: string;
  readonly contactName?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
}

/** Body of PATCH /suppliers/:id: only the fields that change; null empties one. */
export interface UpdateSupplierDto {
  readonly name?: string;
  readonly contactName?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
}
