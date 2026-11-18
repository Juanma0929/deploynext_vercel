"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

import { ROLE_LABELS, ROLES, isRole, type Role } from "@/shared/domain/role";

import type { User } from "../domain/user";
import type { UserChanges } from "../domain/user-input";
import { isSelf } from "../domain/user-policy";
import { useUsers } from "./use-users";
import { createUserSchema, editUserSchema, type UserFormField } from "./user-schemas";

type FieldErrors = Partial<Record<UserFormField, string>>;

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:bg-slate-100 " +
  "read-only:text-muted disabled:bg-slate-100 aria-[invalid=true]:border-red-500";

interface UserFormProps {
  /** The user to edit; without one, the form creates a new user. */
  readonly user?: User;
  readonly onDone: () => void;
  readonly onCancel: () => void;
}

/** Creates a user, or edits one. When editing, the email is read-only. */
export function UserForm({ user, onDone, onCancel }: UserFormProps) {
  const { currentUserId, create, update } = useUsers();
  const isEdit = user !== undefined;
  const isOwnAccount = isEdit && isSelf(currentUserId, user);
  const ids = { name: useId(), email: useId(), password: useId(), role: useId(), active: useId() };

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "seller");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = isEdit
      ? editUserSchema.safeParse({ name, password, role, isActive })
      : createUserSchema.safeParse({ name, email, password, role });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "email" || field === "password" || field === "role") {
          next[field] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});

    setIsSaving(true);
    const result = isEdit
      ? await update(user, changesFrom(user, { name, password, role, isActive }))
      : await create({ name, email, password, role });
    setIsSaving(false);

    if (result.ok) {
      onDone();
    } else if (result.field === "email") {
      setErrors({ email: result.message });
    } else {
      setFormError(result.message);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError !== null && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <Field id={ids.name} label="Nombre" error={errors.name}>
        <input
          id={ids.name}
          name="name"
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? `${ids.name}-error` : undefined}
          className={INPUT_CLASS}
        />
      </Field>

      <Field
        id={ids.email}
        label="Correo"
        error={errors.email}
        hint={isEdit ? "El correo no se puede cambiar." : undefined}
      >
        <input
          id={ids.email}
          name="email"
          type="email"
          autoComplete="off"
          readOnly={isEdit}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email !== undefined}
          aria-describedby={`${ids.email}-hint ${errors.email ? `${ids.email}-error` : ""}`}
          className={INPUT_CLASS}
        />
      </Field>

      <Field
        id={ids.password}
        label={isEdit ? "Nueva contraseña" : "Contraseña"}
        error={errors.password}
        hint={isEdit ? "Déjala vacía para no cambiarla. Mínimo 8 caracteres." : "Mínimo 8 caracteres."}
      >
        <input
          id={ids.password}
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={errors.password !== undefined}
          aria-describedby={`${ids.password}-hint ${errors.password ? `${ids.password}-error` : ""}`}
          className={INPUT_CLASS}
        />
      </Field>

      <Field
        id={ids.role}
        label="Rol"
        error={errors.role}
        hint={isOwnAccount ? "No puedes cambiar tu propio rol." : undefined}
      >
        <select
          id={ids.role}
          name="role"
          value={role}
          disabled={isOwnAccount}
          onChange={(event) => {
            if (isRole(event.target.value)) setRole(event.target.value);
          }}
          aria-describedby={`${ids.role}-hint`}
          className={INPUT_CLASS}
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      {isEdit && (
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.active} className="flex items-center gap-2 text-sm font-medium">
            <input
              id={ids.active}
              type="checkbox"
              checked={isActive}
              disabled={isOwnAccount}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4"
            />
            Cuenta activa
          </label>
          <p className="text-muted text-xs">
            {isOwnAccount
              ? "No puedes desactivar tu propia cuenta."
              : "Si la desactivas, el usuario pierde el acceso de inmediato."}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}

interface FormValues {
  readonly name: string;
  readonly password: string;
  readonly role: Role;
  readonly isActive: boolean;
}

/** Only what changed. An empty password keeps the current one. */
function changesFrom(user: User, values: FormValues): UserChanges {
  const name = values.name.trim();
  return {
    ...(name !== user.name ? { name } : {}),
    ...(values.password !== "" ? { password: values.password } : {}),
    ...(values.role !== user.role ? { role: values.role } : {}),
    ...(values.isActive !== user.isActive ? { isActive: values.isActive } : {}),
  };
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly hint?: string | undefined;
  readonly children: ReactNode;
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
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
