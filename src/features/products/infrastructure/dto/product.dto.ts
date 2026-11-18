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

/**
 * The body of POST /products. The amounts must travel as numbers: the API
 * validates them with @IsInt(), so "2900" as a string answers 400. Optional
 * fields are left out when empty.
 */
export interface CreateProductDto {
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly barcode?: string;
  readonly purchasePrice: number;
  readonly salePrice: number;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierId: string;
}

/** The fields of GET /suppliers that products needs. */
export interface SupplierNameDto {
  readonly id: string;
  readonly name: string;
}
