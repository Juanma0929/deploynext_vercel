/**
 * The body of POST /sales/:id/payment. Only the fields of the method: the API
 * refuses unknown ones. With CARD it receives the Wompi token, never the card.
 */
export type CreatePaymentDto =
  | {
      readonly customerEmail: string;
      readonly method: "NEQUI";
      readonly phoneNumber: string;
    }
  | {
      readonly customerEmail: string;
      readonly method: "CARD";
      readonly cardToken: string;
      readonly installments: number;
    };

/** The fields of the sale it answers with that payments needs. */
export interface ChargedSaleDto {
  readonly id: string;
  readonly status: string;
  readonly paymentTransactionId: string | null;
  readonly paymentMethod: string | null;
}
