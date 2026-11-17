"use client";

import { useState, type FormEvent } from "react";

import { errorMessage } from "@/shared/domain/app-error";
import { Alert, Button, InputField } from "@/shared/presentation";

import { useAuth } from "./use-auth";

/**
 * The login form. It holds no rule of its own: the validation comes from the
 * Credentials entity and the request from the use case, both reached through
 * the facade hook.
 */
export function LoginForm() {
  const { login, isWorking } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login({ email, password, twoFactorCode });
    } catch (cause) {
      // Both the invariants of the entity and the errors of the API arrive
      // here with a message already written for the user.
      setError(errorMessage(cause));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && <Alert>{error}</Alert>}

      <InputField
        label="Correo"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        autoFocus
        placeholder="admin@stockpyme.com"
      />

      <InputField
        label="Contraseña"
        type="password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
      />

      <InputField
        label="Código de verificación (opcional)"
        hint="Solo si tienes autenticación en dos pasos activada."
        name="code"
        value={twoFactorCode}
        onChange={(event) => setTwoFactorCode(event.target.value)}
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        placeholder="123456"
      />

      <Button type="submit" isLoading={isWorking} className="mt-2">
        {isWorking ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
