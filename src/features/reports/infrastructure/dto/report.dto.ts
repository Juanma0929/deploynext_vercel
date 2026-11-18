/** The reports exactly as the API sends them. Amounts are whole pesos. */

export interface SalesReportDto {
  readonly from: string;
  readonly to: string;
  readonly salesCount: number;
  readonly revenue: number;
  readonly profit: number;
  readonly byDay: ReadonlyArray<{
    readonly date: string;
    readonly salesCount: number;
    readonly revenue: number;
    readonly profit: number;
  }>;
}

export interface TopProductRowDto {
  readonly productId: string;
  readonly name: string;
  readonly quantitySold: number;
  readonly revenue: number;
  readonly profit: number;
}

export interface LowStockRowDto {
  readonly productId: string;
  readonly name: string;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierId: string;
  readonly supplierName: string;
}
