/** The part of a user of GET /users that the history needs. */
export interface SellerDto {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
}
