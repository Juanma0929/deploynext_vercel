import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

export interface ProductProps {
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
 * A product of the inventory. It cannot exist with an empty name, a price
 * that is not a whole non-negative number of pesos, or a stock that is not a
 * whole non-negative number. Empty optional fields are kept as null.
 */
export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly barcode: string | null;
  readonly purchasePrice: Money;
  readonly salePrice: Money;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly supplierId: string;
  readonly isActive: boolean;

  constructor(props: ProductProps) {
    const name = props.name.trim();
    if (name === "") throw new DomainError("El nombre del producto es obligatorio.");

    const purchasePrice = Money.cop(props.purchasePrice);
    const salePrice = Money.cop(props.salePrice);
    if (purchasePrice.isNegative() || salePrice.isNegative()) {
      throw new DomainError("Los precios de un producto no pueden ser negativos.");
    }

    if (!isStock(props.currentStock) || !isStock(props.minimumStock)) {
      throw new DomainError("El stock de un producto debe ser un número entero mayor o igual a 0.");
    }

    this.id = props.id;
    this.name = name;
    this.description = optional(props.description);
    this.category = optional(props.category);
    this.barcode = optional(props.barcode);
    this.purchasePrice = purchasePrice;
    this.salePrice = salePrice;
    this.currentStock = props.currentStock;
    this.minimumStock = props.minimumStock;
    this.supplierId = props.supplierId;
    this.isActive = props.isActive;
  }

  /** The rule of the API: a product is in low stock when currentStock <= minimumStock. */
  get isLowStock(): boolean {
    return this.currentStock <= this.minimumStock;
  }
}

function isStock(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function optional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
