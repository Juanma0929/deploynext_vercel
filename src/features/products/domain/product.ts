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

  /**
   * Whether it has to be restocked: active and in low stock, the same rule as
   * GET /products/low-stock. An inactive product is not sold, so it is not
   * restocked either.
   */
  get needsRestock(): boolean {
    return this.isActive && this.isLowStock;
  }

  /**
   * What each unit leaves: salePrice − purchasePrice. It can be negative,
   * since the API allows selling below cost.
   */
  get margin(): Money {
    return this.salePrice.subtract(this.purchasePrice);
  }

  /**
   * The product as plain data, to hand it to a Client Component (only plain
   * objects can cross that boundary). `new Product(product.toProps())` gives
   * the same product back.
   */
  toProps(): ProductProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      barcode: this.barcode,
      purchasePrice: this.purchasePrice.amount,
      salePrice: this.salePrice.amount,
      currentStock: this.currentStock,
      minimumStock: this.minimumStock,
      supplierId: this.supplierId,
      isActive: this.isActive,
    };
  }
}

function isStock(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function optional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
