"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import { credentialsSchema, twoFactorCodeSchema } from "./login-schema";
import { useAuth } from "./use-auth";

type Step = "credentials" | "two-factor";

interface FieldErrors {
  email?: string;
  password?: string;
  code?: string;
}

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:bg-slate-100 " +
  "aria-[invalid=true]:border-red-500";

/**
 * Email and password; and, when the API answers that the account has 2FA, a
 * second step that sends the same credentials again with the six-digit code.
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = { email: useId(), password: useId(), code: useId(), error: useId() };

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const credentials = credentialsSchema.safeParse({ email, password });
    const codeResult = step === "two-factor" ? twoFactorCodeSchema.safeParse(code) : null;

    const errors: FieldErrors = {};
    if (!credentials.success) {
      for (const issue of credentials.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") errors[field] ??= issue.message;
      }
    }
    if (codeResult !== null && !codeResult.success) {
      errors.code = codeResult.error.issues[0]?.message ?? "Código inválido.";
    }
    setFieldErrors(errors);
    if (!credentials.success || (codeResult !== null && !codeResult.success)) return;

    setIsSubmitting(true);
    const outcome = await login(
      codeResult === null ? credentials.data : { ...credentials.data, code: codeResult.data },
    );
    setIsSubmitting(false);

    switch (outcome.kind) {
      case "authenticated":
        router.replace(safeRedirect(searchParams.get("next")));
        return;
      case "two-factor-required":
        setStep("two-factor");
        setNotice(outcome.message);
        return;
      case "invalid-two-factor-code":
        setCode("");
        setFieldErrors({ code: outcome.message });
        return;
      case "failed":
        setFormError(outcome.message);
        return;
    }
  }

  function changeAccount() {
    setStep("credentials");
    setCode("");
    setNotice(null);
    setFieldErrors({});
    setFormError(null);
  }

  const isTwoFactor = step === "two-factor";

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4" aria-describedby={formError ? ids.error : undefined}>
      {formError !== null && (
        <p id={ids.error} role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <Field id={ids.email} label="Correo" error={fieldErrors.email}>
        <input
          id={ids.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={isTwoFactor}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors.email !== undefined}
          aria-describedby={fieldErrors.email ? `${ids.email}-error` : undefined}
          className={INPUT_CLASS}
        />
      </Field>

      <Field id={ids.password} label="Contraseña" error={fieldErrors.password}>
        <input
          id={ids.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          readOnly={isTwoFactor}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fieldErrors.password !== undefined}
          aria-describedby={fieldErrors.password ? `${ids.password}-error` : undefined}
          className={INPUT_CLASS}
        />
      </Field>

      {isTwoFactor && (
        <>
          {notice !== null && (
            <p role="status" className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {notice}
            </p>
          )}
          <Field id={ids.code} label="Código de verificación" error={fieldErrors.code}>
            <input
              id={ids.code}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-invalid={fieldErrors.code !== undefined}
              aria-describedby={fieldErrors.code ? `${ids.code}-error` : undefined}
              className={`${INPUT_CLASS} text-center font-mono tracking-[0.5em]`}
            />
          </Field>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : isTwoFactor ? "Verificar e ingresar" : "Iniciar sesión"}
      </button>

      {isTwoFactor && (
        <button type="button" onClick={changeAccount} className="text-primary text-sm hover:underline">
          Usar otra cuenta
        </button>
      )}
    </form>
  );
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Only paths of this app: "//evil.com" or "https://…" would leave it. */
function safeRedirect(next: string | null): string {
  if (next === null || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
