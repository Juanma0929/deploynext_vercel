/** The body of POST /sales/:id/payment for Nequi. No other field: the API refuses unknown ones. */
export interface CreateNequiPaymentDto {
  readonly customerEmail: string;
  readonly method: "NEQUI";
  readonly phoneNumber: string;
}

/** The fields of the sale it answers with that payments needs. */
export interface ChargedSaleDto {
  readonly id: string;
  readonly status: string;
  readonly paymentTransactionId: string | null;
  readonly paymentMethod: string | null;
}
