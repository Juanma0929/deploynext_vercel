import Form from "next/form";
import Link from "next/link";

import type { SupplierName } from "../domain/product.repository";
import type { ProductFilters } from "../domain/product-filters";
import {
  INVENTORY_PARAMS,
  INVENTORY_PATH,
  LOW_STOCK_IN_URL,
  statusInUrl,
} from "./inventory-search-params";

interface InventoryFiltersProps {
  readonly filters: ProductFilters;
  readonly categories: readonly string[];
  readonly suppliers: readonly SupplierName[];
}

const FIELD =
  "focus:border-primary focus:ring-primary/20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2";

/**
 * The filters of the inventory, as a GET form: submitting it writes them into
 * the URL (?q=&categoria=&proveedor=&estado=&stock=), which is what the page
 * reads. Filtering always goes back to the first page, because the form does
 * not send ?pagina=.
 */
export function InventoryFilters({ filters, categories, suppliers }: InventoryFiltersProps) {
  const isFiltered =
    filters.term !== "" ||
    filters.category !== "" ||
    filters.supplierId !== "" ||
    filters.status !== "all" ||
    filters.lowStockOnly;

  return (
    <search>
      <Form
        action={INVENTORY_PATH}
        replace
        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs font-medium">Nombre o código de barras</span>
          <input
            type="search"
            name={INVENTORY_PARAMS.term}
            defaultValue={filters.term}
            placeholder="Ej. arroz o 7702001"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Categoría</span>
          <select name={INVENTORY_PARAMS.category} defaultValue={filters.category} className={FIELD}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Proveedor</span>
          <select
            name={INVENTORY_PARAMS.supplierId}
            defaultValue={filters.supplierId}
            className={FIELD}
          >
            <option value="">Todos</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Estado</span>
          <select
            name={INVENTORY_PARAMS.status}
            defaultValue={statusInUrl(filters.status)}
            className={FIELD}
          >
            <option value="">Activos e inactivos</option>
            <option value={statusInUrl("active")}>Solo activos</option>
            <option value={statusInUrl("inactive")}>Solo inactivos</option>
          </select>
        </label>

        <label className="flex items-center gap-2 self-end py-2 text-sm">
          <input
            type="checkbox"
            name={INVENTORY_PARAMS.lowStock}
            value={LOW_STOCK_IN_URL}
            defaultChecked={filters.lowStockOnly}
            className="accent-primary size-4"
          />
          Solo stock bajo
        </label>

        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Filtrar
          </button>
          {isFiltered && (
            <Link href={INVENTORY_PATH} className="text-sm font-medium underline">
              Quitar filtros
            </Link>
          )}
        </div>
      </Form>
    </search>
  );
}
