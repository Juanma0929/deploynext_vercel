"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import type { SupplierName } from "../domain/product.repository";
import {
  hasIssues,
  productIssues,
  sellsBelowCost,
  type ProductField,
  type ProductFormValues,
  type ProductIssues,
} from "../domain/product-input";
import { INVENTORY_PATH } from "./inventory-search-params";
import { useCreateProduct } from "./use-create-product";

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  category: "",
  barcode: "",
  purchasePrice: "",
  salePrice: "",
  currentStock: "0",
  minimumStock: "0",
  supplierId: "",
};

interface ProductFormProps {
  /** The suppliers to choose from, loaded by the route on the server. */
  readonly suppliers: readonly SupplierName[];
}

/**
 * Creates a product. The rules come from the domain (productIssues), so the
 * form checks exactly what the entity and the API check. Selling below cost
 * is only a warning: the API allows it.
 */
export function ProductForm({ suppliers }: ProductFormProps) {
  const router = useRouter();
  const create = useCreateProduct();
  const ids = {
    name: useId(),
    description: useId(),
    category: useId(),
    barcode: useId(),
    purchasePrice: useId(),
    salePrice: useId(),
    currentStock: useId(),
    minimumStock: useId(),
    supplierId: useId(),
  } satisfies Record<ProductField, string>;

  const [values, setValues] = useState<ProductFormValues>(EMPTY);
  const [issues, setIssues] = useState<ProductIssues>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const belowCost = sellsBelowCost(values);

  function set(field: ProductField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // A field the user is fixing stops showing its old error.
    setIssues((current) => {
      if (current[field] === undefined) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = productIssues(values);
    setIssues(found);
    if (hasIssues(found)) return;

    setIsSaving(true);
    const result = await create(values);

    if (!result.ok) {
      setIsSaving(false);
      setIssues(result.issues);
      setFormError(result.message);
      return;
    }
    // refresh() so the inventory, rendered on the server, includes the new product.
    router.push(`/productos/${result.productId}`);
    router.refresh();
  }

  function describedBy(field: ProductField, hint: boolean): string | undefined {
    const id = ids[field];
    return [hint ? `${id}-hint` : "", issues[field] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  }

  function text(field: ProductField, label: string, options: TextOptions = {}) {
    const id = ids[field];
    return (
      <Field
        id={id}
        label={label}
        error={issues[field]}
        hint={options.hint}
        required={options.required ?? false}
      >
        <input
          id={id}
          name={field}
          type="text"
          inputMode={options.numeric ? "numeric" : undefined}
          autoComplete="off"
          value={values[field]}
          onChange={(event) => set(field, event.target.value)}
          aria-invalid={issues[field] !== undefined}
          aria-describedby={describedBy(field, options.hint !== undefined)}
          aria-required={options.required}
          className={INPUT_CLASS}
        />
      </Field>
    );
  }

  if (suppliers.length === 0) {
    return (
      <p className="max-w-xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Para crear un producto primero tiene que existir su proveedor.{" "}
        <Link href="/proveedores/nuevo" className="font-medium underline">
          Crea un proveedor
        </Link>
        .
      </p>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {formError !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      {text("name", "Nombre", { required: true })}

      <Field
        id={ids.description}
        label="Descripción"
        error={issues.description}
        hint={undefined}
        required={false}
      >
        <textarea
          id={ids.description}
          name="description"
          rows={2}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          className={INPUT_CLASS}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        {text("category", "Categoría", { hint: "Texto libre, por ejemplo Lácteos." })}
        {text("barcode", "Código de barras", { hint: "Si lo dejas vacío, no se guarda." })}
      </div>

      <Field
        id={ids.supplierId}
        label="Proveedor"
        error={issues.supplierId}
        hint={undefined}
        required
      >
        <select
          id={ids.supplierId}
          name="supplierId"
          value={values.supplierId}
          onChange={(event) => set("supplierId", event.target.value)}
          aria-invalid={issues.supplierId !== undefined}
          aria-describedby={describedBy("supplierId", false)}
          aria-required
          className={INPUT_CLASS}
        >
          <option value="">Elige un proveedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Precios, en pesos enteros</legend>
        {text("purchasePrice", "Precio de compra", { required: true, numeric: true })}
        {text("salePrice", "Precio de venta", { required: true, numeric: true })}
        {belowCost && (
          <p
            role="status"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2"
          >
            El precio de venta es menor que el de compra: cada unidad se vendería con pérdida. Puedes
            guardarlo igual, por ejemplo para una liquidación.
          </p>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Inventario</legend>
        {text("currentStock", "Stock actual", { required: true, numeric: true })}
        {text("minimumStock", "Stock mínimo", {
          required: true,
          numeric: true,
          hint: "Se marca stock bajo cuando el actual llega a este valor.",
        })}
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href={INVENTORY_PATH}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}

interface TextOptions {
  readonly required?: boolean;
  readonly numeric?: boolean;
  readonly hint?: string;
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly hint: string | undefined;
  readonly required: boolean;
  readonly children: ReactNode;
}

function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true"> *</span>
        ) : (
          <span className="text-muted font-normal"> (opcional)</span>
        )}
      </label>
      {children}
      {hint !== undefined && (
        <p id={`${id}-hint`} className="text-muted text-xs">
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
