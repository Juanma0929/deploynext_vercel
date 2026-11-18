"use client";

import { useId, useState, type FormEvent } from "react";

import { ROLE_LABELS, ROLES, isRole, type Role } from "@/shared/domain/role";
import { Alert, Button, Checkbox, Field, Select, TextInput, describedBy } from "@/shared/presentation/ui";

import type { User } from "../domain/user";
import type { UserChanges } from "../domain/user-input";
import { isSelf } from "../domain/user-policy";
import { useUsers } from "./use-users";
import { createUserSchema, editUserSchema, type UserFormField } from "./user-schemas";

type FieldErrors = Partial<Record<UserFormField, string>>;

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
    } else {
      setErrors(result.fieldErrors);
      setFormError(result.message);
    }
  }

  const emailHint = isEdit ? "El correo no se puede cambiar." : undefined;
  const passwordHint = isEdit ? "Déjala vacía para no cambiarla. Mínimo 8 caracteres." : "Mínimo 8 caracteres.";
  const roleHint = isOwnAccount ? "No puedes cambiar tu propio rol." : undefined;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError !== null && (
        <Alert tone="danger">
          <p>{formError}</p>
        </Alert>
      )}

      <Field id={ids.name} label="Nombre" error={errors.name}>
        <TextInput
          id={ids.name}
          name="name"
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          invalid={errors.name !== undefined}
          aria-describedby={describedBy(ids.name, { error: errors.name })}
        />
      </Field>

      <Field id={ids.email} label="Correo" error={errors.email} hint={emailHint}>
        <TextInput
          id={ids.email}
          name="email"
          type="email"
          autoComplete="off"
          readOnly={isEdit}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={errors.email !== undefined}
          aria-describedby={describedBy(ids.email, { hint: emailHint, error: errors.email })}
          className="read-only:text-muted"
        />
      </Field>

      <Field
        id={ids.password}
        label={isEdit ? "Nueva contraseña" : "Contraseña"}
        error={errors.password}
        hint={passwordHint}
      >
        <TextInput
          id={ids.password}
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={errors.password !== undefined}
          aria-describedby={describedBy(ids.password, { hint: passwordHint, error: errors.password })}
        />
      </Field>

      <Field id={ids.role} label="Rol" error={errors.role} hint={roleHint}>
        <Select
          id={ids.role}
          name="role"
          value={role}
          disabled={isOwnAccount}
          onChange={(event) => {
            if (isRole(event.target.value)) setRole(event.target.value);
          }}
          aria-describedby={describedBy(ids.role, { hint: roleHint, error: errors.role })}
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      {isEdit && (
        <div className="flex flex-col gap-1">
          <Checkbox
            id={ids.active}
            label="Cuenta activa"
            checked={isActive}
            disabled={isOwnAccount}
            onChange={(event) => setIsActive(event.target.checked)}
            className="font-medium"
          />
          <p className="text-muted text-xs">
            {isOwnAccount
              ? "No puedes desactivar tu propia cuenta."
              : "Si la desactivas, el usuario pierde el acceso de inmediato."}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSaving} loadingText="Guardando…">
          {isEdit ? "Guardar cambios" : "Crear usuario"}
        </Button>
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
