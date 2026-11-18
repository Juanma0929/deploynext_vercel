import Form from "next/form";
import Link from "next/link";

import { Button, Checkbox, Field, Select, TextInput } from "@/shared/presentation/ui";

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
        {/* Fixed ids: there is one filter form per page, and this is a Server Component. */}
        <Field id="inventory-term" label="Nombre o código de barras" className="lg:col-span-2">
          <TextInput
            id="inventory-term"
            type="search"
            name={INVENTORY_PARAMS.term}
            defaultValue={filters.term}
            placeholder="Ej. arroz o 7702001"
          />
        </Field>

        <Field id="inventory-category" label="Categoría">
          <Select id="inventory-category" name={INVENTORY_PARAMS.category} defaultValue={filters.category}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="inventory-supplier" label="Proveedor">
          <Select id="inventory-supplier" name={INVENTORY_PARAMS.supplierId} defaultValue={filters.supplierId}>
            <option value="">Todos</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="inventory-status" label="Estado">
          <Select id="inventory-status" name={INVENTORY_PARAMS.status} defaultValue={statusInUrl(filters.status)}>
            <option value="">Activos e inactivos</option>
            <option value={statusInUrl("active")}>Solo activos</option>
            <option value={statusInUrl("inactive")}>Solo inactivos</option>
          </Select>
        </Field>

        <Checkbox
          label="Solo stock bajo"
          name={INVENTORY_PARAMS.lowStock}
          value={LOW_STOCK_IN_URL}
          defaultChecked={filters.lowStockOnly}
          className="self-end py-2"
        />

        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
          <Button type="submit">Filtrar</Button>
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
