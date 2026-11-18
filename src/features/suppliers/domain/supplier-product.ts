import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

export interface SupplierProductProps {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly salePrice: number;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly isActive: boolean;
}

/**
 * A product as the detail of its supplier shows it. It is a read-only view of
 * what the supplier supplies, owned by this feature so suppliers does not
 * import products.
 */
export class SupplierProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly salePrice: Money;
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly isActive: boolean;

  constructor(props: SupplierProductProps) {
    if (!Number.isSafeInteger(props.currentStock) || !Number.isSafeInteger(props.minimumStock)) {
      throw new DomainError("El stock de un producto debe ser un número entero.");
    }

    this.id = props.id;
    this.name = props.name;
    this.category = props.category?.trim() || null;
    this.salePrice = Money.cop(props.salePrice);
    this.currentStock = props.currentStock;
    this.minimumStock = props.minimumStock;
    this.isActive = props.isActive;
  }

  /** The API's rule: low stock when currentStock <= minimumStock. */
  get isLowStock(): boolean {
    return this.currentStock <= this.minimumStock;
  }
}
