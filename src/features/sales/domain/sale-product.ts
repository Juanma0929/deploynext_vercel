import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

export interface SaleProductProps {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly salePrice: number;
  readonly currentStock: number;
  readonly isActive: boolean;
}

/**
 * A product as the sale picker sees it: what it costs and how many are left.
 * A read-only view owned by sales, so sales does not import products.
 */
export class SaleProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly salePrice: Money;
  readonly currentStock: number;
  readonly isActive: boolean;

  constructor(props: SaleProductProps) {
    if (!Number.isSafeInteger(props.currentStock)) {
      throw new DomainError("El stock de un producto debe ser un número entero.");
    }

    this.id = props.id;
    this.name = props.name;
    this.category = props.category?.trim() || null;
    this.barcode = props.barcode?.trim() || null;
    this.salePrice = Money.cop(props.salePrice);
    this.currentStock = props.currentStock;
    this.isActive = props.isActive;
  }

  /** Only active products with stock can go into a sale. */
  get isSellable(): boolean {
    return this.isActive && this.currentStock > 0;
  }
}
