"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import {
  Alert,
  Button,
  ButtonLink,
  Field,
  Select,
  TextInput,
  Textarea,
  describedBy,
  useToast,
} from "@/shared/presentation/ui";

import { Product, type ProductProps } from "../domain/product";
import type { SupplierName } from "../domain/product.repository";
import {
  formValuesOf,
  hasIssues,
  productIssues,
  sellsBelowCost,
  type ProductField,
  type ProductFormValues,
  type ProductIssues,
} from "../domain/product-input";
import { INVENTORY_PATH } from "./inventory-search-params";
import { useSaveProduct } from "./use-save-product";

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
  /** The product to edit, as plain data; without one, the form creates a product. */
  readonly product?: ProductProps;
}

interface TextOptions {
  readonly required?: boolean;
  readonly numeric?: boolean;
  readonly hint?: string;
}

/**
 * Creates or edits a product. The rules come from the domain (productIssues),
 * so the form checks exactly what the entity and the API check. Selling below
 * cost is only a warning: the API allows it. An edit sends only the fields
 * that changed.
 */
export function ProductForm({ suppliers, product }: ProductFormProps) {
  const router = useRouter();
  const save = useSaveProduct(product);
  const { toast } = useToast();
  const isEdit = product !== undefined;
  const cancelHref = isEdit ? `/productos/${product.id}` : INVENTORY_PATH;
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

  const [values, setValues] = useState<ProductFormValues>(() =>
    product === undefined ? EMPTY : formValuesOf(new Product(product)),
  );
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
    const result = await save(values);

    if (!result.ok) {
      setIsSaving(false);
      setIssues(result.issues);
      setFormError(result.message);
      return;
    }
    toast({ tone: "success", message: isEdit ? "Cambios guardados." : "Producto creado." });
    // refresh() so the pages rendered on the server show the saved product.
    router.push(`/productos/${result.productId}`);
    router.refresh();
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
        optional={!(options.required ?? false)}
      >
        <TextInput
          id={id}
          name={field}
          type="text"
          inputMode={options.numeric ? "numeric" : undefined}
          autoComplete="off"
          value={values[field]}
          onChange={(event) => set(field, event.target.value)}
          invalid={issues[field] !== undefined}
          aria-describedby={describedBy(id, { hint: options.hint, error: issues[field] })}
          aria-required={options.required}
        />
      </Field>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Alert tone="warning" className="max-w-xl">
        <p>
          Para crear un producto primero tiene que existir su proveedor.{" "}
          <Link href="/proveedores/nuevo" className="font-medium underline">
            Crea un proveedor
          </Link>
          .
        </p>
      </Alert>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {formError !== null && (
        <Alert tone="danger">
          <p>{formError}</p>
        </Alert>
      )}

      {text("name", "Nombre", { required: true })}

      <Field id={ids.description} label="Descripción" optional>
        <Textarea
          id={ids.description}
          name="description"
          rows={2}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        {text("category", "Categoría", { hint: "Texto libre, por ejemplo Lácteos." })}
        {text("barcode", "Código de barras", { hint: "Si lo dejas vacío, no se guarda." })}
      </div>

      <Field id={ids.supplierId} label="Proveedor" error={issues.supplierId} required>
        <Select
          id={ids.supplierId}
          name="supplierId"
          value={values.supplierId}
          onChange={(event) => set("supplierId", event.target.value)}
          invalid={issues.supplierId !== undefined}
          aria-describedby={describedBy(ids.supplierId, { error: issues.supplierId })}
          aria-required
        >
          <option value="">Elige un proveedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Precios, en pesos enteros</legend>
        {text("purchasePrice", "Precio de compra", { required: true, numeric: true })}
        {text("salePrice", "Precio de venta", { required: true, numeric: true })}
        {belowCost && (
          <Alert tone="warning" role="status" className="sm:col-span-2">
            <p>
              El precio de venta es menor que el de compra: cada unidad se vendería con pérdida. Puedes
              guardarlo igual, por ejemplo para una liquidación.
            </p>
          </Alert>
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
        <ButtonLink href={cancelHref} variant="secondary">
          Cancelar
        </ButtonLink>
        <Button type="submit" isLoading={isSaving} loadingText="Guardando…">
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
