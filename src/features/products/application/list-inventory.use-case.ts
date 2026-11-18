import { paginate, type Page } from "@/shared/domain/collections";

import type { Product } from "../domain/product";
import { categoriesOf, filterProducts, type ProductFilters } from "../domain/product-filters";
import type {
  ProductRepository,
  SupplierName,
  SupplierNameRepository,
} from "../domain/product.repository";

export const INVENTORY_PAGE_SIZE = 10;

/** A product with the name of its supplier, as the inventory shows it. */
export interface InventoryRow {
  readonly product: Product;
  /** Null if the supplier is not in GET /suppliers. */
  readonly supplierName: string | null;
}

export interface Inventory {
  readonly page: Page<InventoryRow>;
  /** How many products exist before filtering. */
  readonly totalProducts: number;
  /** The options of the filters, from every product and every supplier. */
  readonly categories: readonly string[];
  readonly suppliers: readonly SupplierName[];
}

/**
 * The inventory: every product, active or not, with the name of its supplier.
 * The API does not filter nor paginate, so both happen here: first the
 * filters, then the page.
 */
export class ListInventoryUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly suppliers: SupplierNameRepository,
  ) {}

  async execute(filters: ProductFilters, page: number): Promise<Inventory> {
    const [products, suppliers] = await Promise.all([
      this.products.list(),
      this.suppliers.list(),
    ]);

    const names = new Map(suppliers.map((supplier) => [supplier.id, supplier.name]));
    const rows = filterProducts(products, filters).map((product) => ({
      product,
      supplierName: names.get(product.supplierId) ?? null,
    }));

    return {
      page: paginate(rows, page, INVENTORY_PAGE_SIZE),
      totalProducts: products.length,
      categories: categoriesOf(products),
      suppliers: [...suppliers].sort((a, b) => a.name.localeCompare(b.name, "es")),
    };
  }
}
