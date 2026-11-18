/** A product as GET /suppliers/:supplierId/products returns it. */
export interface SupplierProductDto {
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
