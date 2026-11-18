/** A sale exactly as GET /sales/today sends it. Amounts are whole pesos. */
export interface SaleItemDto {
  readonly id: string;
  readonly saleId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly unitCost: number;
  readonly subtotal: number;
}

export interface SaleDto {
  readonly id: string;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
  readonly sellerId: string;
  readonly total: number;
  readonly status: string;
  readonly paymentTransactionId: string | null;
  readonly paymentMethod: string | null;
  readonly items: readonly SaleItemDto[];
}
