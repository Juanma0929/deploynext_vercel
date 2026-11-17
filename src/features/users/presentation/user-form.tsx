"use client";

import { useState, type FormEvent } from "react";

import { errorMessage } from "@/shared/domain/app-error";
import { ROLES, type Role } from "@/shared/domain/role";
import { Alert, Button, InputField, ROLE_LABELS, SelectField } from "@/shared/presentation";

import { MIN_PASSWORD_LENGTH, type NewUserInput } from "../domain/user";

interface UserFormProps {
  readonly onSubmit: (input: NewUserInput) => Promise<boolean>;
  readonly onCancel: () => void;
  readonly isWorking: boolean;
}

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

/**
 * The form for a new user. The rules it enforces are the ones the NewUser
 * entity declares: it only shows what the entity rejects.
 */
export function UserForm({ onSubmit, onCancel, isWorking }: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("seller");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit({ name, email, password, role });
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && <Alert>{error}</Alert>}

      <InputField
        label="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />

      <InputField
        label="Correo"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="No se puede cambiar después de crear la cuenta."
      />

      <InputField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        hint={`Mínimo ${String(MIN_PASSWORD_LENGTH)} caracteres.`}
        autoComplete="new-password"
      />

      <SelectField
        label="Rol"
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
        options={ROLE_OPTIONS}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isWorking}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isWorking}>
          Crear usuario
        </Button>
      </div>
    </form>
  );
}
