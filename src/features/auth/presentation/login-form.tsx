"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { Alert, Button, Field, TextInput, describedBy } from "@/shared/presentation/ui";

import { credentialsSchema, twoFactorCodeSchema } from "./login-schema";
import { useAuth } from "./use-auth";

type Step = "credentials" | "two-factor";

interface FieldErrors {
  email?: string;
  password?: string;
  code?: string;
}


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
        <Alert id={ids.error} tone="danger">
          <p>{formError}</p>
        </Alert>
      )}

      <Field id={ids.email} label="Correo" error={fieldErrors.email}>
        <TextInput
          id={ids.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={isTwoFactor}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={fieldErrors.email !== undefined}
          aria-describedby={describedBy(ids.email, { error: fieldErrors.email })}
        />
      </Field>

      <Field id={ids.password} label="Contraseña" error={fieldErrors.password}>
        <TextInput
          id={ids.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          readOnly={isTwoFactor}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={fieldErrors.password !== undefined}
          aria-describedby={describedBy(ids.password, { error: fieldErrors.password })}
        />
      </Field>

      {isTwoFactor && (
        <>
          {notice !== null && (
            <Alert tone="info">
              <p>{notice}</p>
            </Alert>
          )}
          <Field id={ids.code} label="Código de verificación" error={fieldErrors.code}>
            <TextInput
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
              invalid={fieldErrors.code !== undefined}
              aria-describedby={describedBy(ids.code, { error: fieldErrors.code })}
              className="text-center font-mono tracking-[0.5em]"
            />
          </Field>
        </>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingText="Ingresando…">
        {isTwoFactor ? "Verificar e ingresar" : "Iniciar sesión"}
      </Button>

      {isTwoFactor && (
        <Button variant="link" onClick={changeAccount} className="text-primary self-center">
          Usar otra cuenta
        </Button>
      )}
    </form>
  );
}

/** Only paths of this app: "//evil.com" or "https://…" would leave it. */
function safeRedirect(next: string | null): string {
  if (next === null || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
