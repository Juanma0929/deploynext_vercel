import {
  NO_PRODUCT_FILTERS,
  type ProductFilters,
  type ProductStatusFilter,
} from "../domain/product-filters";

export const INVENTORY_PATH = "/productos";

/** The names of the filters in the URL, so a filtered list can be shared. */
export const INVENTORY_PARAMS = {
  term: "q",
  category: "categoria",
  supplierId: "proveedor",
  status: "estado",
  lowStock: "stock",
  page: "pagina",
} as const;

/** The values of ?estado= and of ?stock= in the URL. */
const STATUS_IN_URL: Readonly<Record<Exclude<ProductStatusFilter, "all">, string>> = {
  active: "activos",
  inactive: "inactivos",
};
export const LOW_STOCK_IN_URL = "bajo";

export type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

export interface InventoryQuery {
  readonly filters: ProductFilters;
  readonly page: number;
}

/** Reads the filters and the page from the URL. Anything unknown is ignored. */
export function parseInventoryQuery(params: SearchParams): InventoryQuery {
  const status = first(params[INVENTORY_PARAMS.status]);
  const page = Number.parseInt(first(params[INVENTORY_PARAMS.page]), 10);

  return {
    filters: {
      term: first(params[INVENTORY_PARAMS.term]).trim(),
      category: first(params[INVENTORY_PARAMS.category]).trim(),
      supplierId: first(params[INVENTORY_PARAMS.supplierId]).trim(),
      status:
        status === STATUS_IN_URL.active
          ? "active"
          : status === STATUS_IN_URL.inactive
            ? "inactive"
            : NO_PRODUCT_FILTERS.status,
      lowStockOnly: first(params[INVENTORY_PARAMS.lowStock]) === LOW_STOCK_IN_URL,
    },
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

/** The URL of the inventory with these filters and page. Empty filters are left out. */
export function inventoryHref({ filters, page }: InventoryQuery): string {
  const params = new URLSearchParams();
  if (filters.term !== "") params.set(INVENTORY_PARAMS.term, filters.term);
  if (filters.category !== "") params.set(INVENTORY_PARAMS.category, filters.category);
  if (filters.supplierId !== "") params.set(INVENTORY_PARAMS.supplierId, filters.supplierId);
  if (filters.status !== "all") params.set(INVENTORY_PARAMS.status, STATUS_IN_URL[filters.status]);
  if (filters.lowStockOnly) params.set(INVENTORY_PARAMS.lowStock, LOW_STOCK_IN_URL);
  if (page > 1) params.set(INVENTORY_PARAMS.page, String(page));

  const query = params.toString();
  return query === "" ? INVENTORY_PATH : `${INVENTORY_PATH}?${query}`;
}

export function statusInUrl(status: ProductStatusFilter): string {
  return status === "all" ? "" : STATUS_IN_URL[status];
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
