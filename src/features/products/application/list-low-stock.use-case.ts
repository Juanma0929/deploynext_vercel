import type { Product } from "../domain/product";
import type { ProductRepository, SupplierNameRepository } from "../domain/product.repository";
import type { InventoryRow } from "./list-inventory.use-case";

/**
 * The products to restock, for every role: the active ones with
 * currentStock <= minimumStock (GET /products/low-stock), with the name of
 * their supplier, so the list says whom to call.
 *
 * The most urgent go first: the ones furthest below their minimum, and among
 * equals, by name.
 */
export class ListLowStockUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly suppliers: SupplierNameRepository,
  ) {}

  async execute(): Promise<InventoryRow[]> {
    const [products, suppliers] = await Promise.all([
      this.products.listLowStock(),
      this.suppliers.list(),
    ]);

    const names = new Map(suppliers.map((supplier) => [supplier.id, supplier.name]));
    return [...products]
      .sort((a, b) => shortfall(b) - shortfall(a) || a.name.localeCompare(b.name, "es"))
      .map((product) => ({ product, supplierName: names.get(product.supplierId) ?? null }));
  }
}

/** How many units are missing to get back to the minimum. */
function shortfall(product: Product): number {
  return product.minimumStock - product.currentStock;
}
