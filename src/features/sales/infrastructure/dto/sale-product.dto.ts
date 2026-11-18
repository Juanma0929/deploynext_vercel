/** A product as GET /products returns it; the picker reads only part of it. */
export interface SaleProductDto {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly salePrice: number;
  readonly currentStock: number;
  readonly isActive: boolean;
}

/** Body of POST /sales: products and quantities, never prices. */
export interface CreateSaleDto {
  readonly items: readonly { readonly productId: string; readonly quantity: number }[];
}
