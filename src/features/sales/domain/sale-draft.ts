import { DomainError } from "@/shared/domain/errors";
import { Money } from "@/shared/domain/money";

import type { SaleProduct } from "./sale-product";

/** One product of the cart and how many units of it. */
export interface DraftLine {
  readonly product: SaleProduct;
  readonly quantity: number;
  /** salePrice × quantity. An estimate: the server sets the real prices. */
  readonly estimatedSubtotal: Money;
}

/** What POST /sales receives for each product. No prices: the server sets them. */
export interface SaleItem {
  readonly productId: string;
  readonly quantity: number;
}

/** What changed in the cart when the products were refreshed. */
export interface DraftAdjustment {
  readonly productName: string;
  readonly kind: "removed" | "reduced";
  /** For "reduced": the quantity it was lowered to. */
  readonly quantity?: number;
}

/**
 * The cart of a sale being put together. It is immutable: every change
 * returns a new draft, which suits React state.
 *
 * - Adding a product that is already in the cart adds to its quantity: the
 *   API refuses a sale with the same productId twice.
 * - A quantity is a whole number from 1 to the current stock.
 * - Only sellable products (active, with stock) can be added.
 * - An empty cart cannot be sent.
 */
export class SaleDraft {
  private constructor(private readonly byProduct: ReadonlyMap<string, DraftLine>) {}

  static empty(): SaleDraft {
    return new SaleDraft(new Map());
  }

  /** In the order they were added. */
  get lines(): readonly DraftLine[] {
    return [...this.byProduct.values()];
  }

  get isEmpty(): boolean {
    return this.byProduct.size === 0;
  }

  /** How many units, adding every line. */
  get unitCount(): number {
    return this.lines.reduce((count, line) => count + line.quantity, 0);
  }

  /** The sum of salePrice × quantity. The server computes the real total. */
  get estimatedTotal(): Money {
    return Money.sum(this.lines.map((line) => line.estimatedSubtotal));
  }

  quantityOf(productId: string): number {
    return this.byProduct.get(productId)?.quantity ?? 0;
  }

  /** How many more units of the product fit, given its stock. */
  remainingFor(product: SaleProduct): number {
    return Math.max(0, product.currentStock - this.quantityOf(product.id));
  }

  add(product: SaleProduct, quantity = 1): SaleDraft {
    if (!product.isSellable) {
      throw new DomainError(`${product.name} no está disponible para la venta.`);
    }
    return this.withLine(product, this.quantityOf(product.id) + quantity);
  }

  setQuantity(productId: string, quantity: number): SaleDraft {
    const line = this.byProduct.get(productId);
    if (line === undefined) throw new DomainError("Ese producto no está en la venta.");
    return this.withLine(line.product, quantity);
  }

  remove(productId: string): SaleDraft {
    if (!this.byProduct.has(productId)) return this;
    const next = new Map(this.byProduct);
    next.delete(productId);
    return new SaleDraft(next);
  }

  /** The body of POST /sales. Throws when the cart is empty. */
  toItems(): SaleItem[] {
    if (this.isEmpty) throw new DomainError("Agrega al menos un producto a la venta.");
    return this.lines.map((line) => ({ productId: line.product.id, quantity: line.quantity }));
  }

  /**
   * Brings the cart up to date with freshly loaded products, as after a 409:
   * a product that is gone or no longer sellable is removed, and a quantity
   * above the new stock is lowered to it. Prices are refreshed too.
   */
  reconcile(products: readonly SaleProduct[]): { draft: SaleDraft; adjustments: DraftAdjustment[] } {
    const fresh = new Map(products.map((product) => [product.id, product]));
    const next = new Map<string, DraftLine>();
    const adjustments: DraftAdjustment[] = [];

    for (const line of this.byProduct.values()) {
      const product = fresh.get(line.product.id);
      if (product === undefined || !product.isSellable) {
        adjustments.push({ productName: line.product.name, kind: "removed" });
        continue;
      }
      const quantity = Math.min(line.quantity, product.currentStock);
      if (quantity < line.quantity) {
        adjustments.push({ productName: product.name, kind: "reduced", quantity });
      }
      next.set(product.id, lineOf(product, quantity));
    }

    return { draft: new SaleDraft(next), adjustments };
  }

  private withLine(product: SaleProduct, quantity: number): SaleDraft {
    assertValidQuantity(product, quantity);
    const next = new Map(this.byProduct);
    next.set(product.id, lineOf(product, quantity));
    return new SaleDraft(next);
  }
}

function lineOf(product: SaleProduct, quantity: number): DraftLine {
  return { product, quantity, estimatedSubtotal: product.salePrice.times(quantity) };
}

function assertValidQuantity(product: SaleProduct, quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new DomainError("La cantidad debe ser un número entero mayor o igual a 1.");
  }
  if (quantity > product.currentStock) {
    throw new DomainError(
      `Solo hay ${product.currentStock} ${product.currentStock === 1 ? "unidad" : "unidades"} de ${product.name}.`,
    );
  }
}
