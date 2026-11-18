/** A supplier as GET /suppliers returns it. */
export interface SupplierDto {
  readonly id: string;
  readonly name: string;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
}
