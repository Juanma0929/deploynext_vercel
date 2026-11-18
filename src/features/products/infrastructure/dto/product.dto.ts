/** A product as GET /products returns it. Prices are whole pesos. */
export interface ProductDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly purchasePrice: number;
  readonly salePrice: number;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierId: string;
  readonly isActive: boolean;
}

/** The fields of GET /suppliers that products needs. */
export interface SupplierNameDto {
  readonly id: string;
  readonly name: string;
}
