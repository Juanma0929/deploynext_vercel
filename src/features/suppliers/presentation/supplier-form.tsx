"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import type { SupplierProps } from "../domain/supplier";
import type { SupplierFormValues } from "../domain/supplier-input";
import { supplierSchema, type SupplierFormField } from "./supplier-schema";
import { useSaveSupplier } from "./use-save-supplier";

type FieldErrors = Partial<Record<SupplierFormField, string>>;

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-500";

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
    const describedBy = [extra.hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ");

    return (
      <Field id={id} label={label} error={error} hint={extra.hint} required={extra.required ?? false}>
        <input
          id={id}
          name={field}
          type={extra.type ?? "text"}
          autoComplete={extra.autoComplete ?? "off"}
          value={values[field]}
          onChange={(event) => set(field, event.target.value)}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy || undefined}
          aria-required={extra.required}
          className={INPUT_CLASS}
        />
      </Field>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      {formError !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
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
        <Link
          href={cancelHref}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear proveedor"}
        </button>
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
