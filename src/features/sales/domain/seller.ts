/** Who registered a sale, as the history shows it. Read from GET /users. */
export interface Seller {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
}

/** The port to the people who can sell (GET /users, admin only). */
export interface SellerDirectory {
  list(): Promise<Seller[]>;
}
