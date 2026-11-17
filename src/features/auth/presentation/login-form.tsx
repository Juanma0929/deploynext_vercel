"use client";

import { useState, type FormEvent } from "react";

import { errorMessage } from "@/shared/domain/app-error";

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
      {error !== null && (
        <p
          role="alert"
          className="border-danger/30 bg-danger/5 text-danger rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Correo</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          autoFocus
          className="border-border bg-surface focus:border-primary rounded-md border px-3 py-2 text-base outline-none"
          placeholder="admin@stockpyme.com"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Contraseña</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="border-border bg-surface focus:border-primary rounded-md border px-3 py-2 text-base outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">
          Código de verificación <span className="text-muted">(opcional)</span>
        </span>
        <input
          type="text"
          name="code"
          value={twoFactorCode}
          onChange={(event) => setTwoFactorCode(event.target.value)}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          className="border-border bg-surface focus:border-primary rounded-md border px-3 py-2 text-base outline-none"
          placeholder="123456"
        />
        <span className="text-muted text-xs">
          Solo si tienes autenticación en dos pasos activada.
        </span>
      </label>

      <button
        type="submit"
        disabled={isWorking}
        className="bg-primary text-primary-foreground mt-2 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {isWorking ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
