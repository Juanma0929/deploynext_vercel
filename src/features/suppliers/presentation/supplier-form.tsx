"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { Alert, Button, ButtonLink, Field, TextInput, describedBy } from "@/shared/presentation/ui";

import type { SupplierProps } from "../domain/supplier";
import type { SupplierFormValues } from "../domain/supplier-input";
import { supplierSchema, type SupplierFormField } from "./supplier-schema";
import { useSaveSupplier } from "./use-save-supplier";

type FieldErrors = Partial<Record<SupplierFormField, string>>;


interface SupplierFormProps {
  /** The supplier to edit; without one, the form creates a new supplier. */
  readonly supplier?: SupplierProps;
}

/**
 * Creates or edits a supplier. Only the name is required; an optional field
 * left empty is stored as null.
 */
export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter();
  const save = useSaveSupplier(supplier);
  const isEdit = supplier !== undefined;
  const ids = {
    name: useId(),
    contactName: useId(),
    phone: useId(),
    email: useId(),
    address: useId(),
  };

  const [values, setValues] = useState<SupplierFormValues>({
    name: supplier?.name ?? "",
    contactName: supplier?.contactName ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cancelHref = isEdit ? `/proveedores/${supplier.id}` : "/proveedores";

  function set(field: SupplierFormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = supplierSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values) {
          next[field as SupplierFormField] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});

    setIsSaving(true);
    const result = await save(values);

    if (!result.ok) {
      setIsSaving(false);
      setFormError(result.message);
      return;
    }
    // refresh() so the server-rendered detail shows the saved data.
    router.push(`/proveedores/${result.supplier.id}`);
    router.refresh();
  }

  function input(field: SupplierFormField, label: string, extra: InputExtra = {}) {
    const id = ids[field];
    const error = errors[field];
    const required = extra.required ?? false;

    return (
      <Field id={id} label={label} error={error} hint={extra.hint} required={required} optional={!required}>
        <TextInput
          id={id}
          name={field}
          type={extra.type ?? "text"}
          autoComplete={extra.autoComplete ?? "off"}
          value={values[field]}
          onChange={(event) => set(field, event.target.value)}
          invalid={error !== undefined}
          aria-describedby={describedBy(id, { hint: extra.hint, error })}
          aria-required={extra.required}
        />
      </Field>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      {formError !== null && (
        <Alert tone="danger">
          <p>{formError}</p>
        </Alert>
      )}

      {input("name", "Nombre", { required: true, autoComplete: "organization" })}
      {input("contactName", "Persona de contacto")}
      {input("phone", "Teléfono", { type: "tel" })}
      {input("email", "Correo", { type: "email" })}
      {input("address", "Dirección")}

      <p className="text-muted text-xs">
        Solo el nombre es obligatorio. Los campos que dejes vacíos quedan sin dato.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLink href={cancelHref} variant="secondary">
          Cancelar
        </ButtonLink>
        <Button type="submit" isLoading={isSaving} loadingText="Guardando…">
          {isEdit ? "Guardar cambios" : "Crear proveedor"}
        </Button>
      </div>
    </form>
  );
}

interface InputExtra {
  readonly type?: "text" | "tel" | "email";
  readonly autoComplete?: string;
  readonly required?: boolean;
  readonly hint?: string;
}
