import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm, ServerWakeUp } from "@/features/auth/presentation";
import {
  SESSION_EXPIRED_MESSAGE,
  SESSION_EXPIRED_REASON,
  SESSION_REASON_PARAM,
} from "@/shared/domain/session";
import { Alert } from "@/shared/presentation/ui";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

interface LoginPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const sessionExpired = params[SESSION_REASON_PARAM] === SESSION_EXPIRED_REASON;

  return (
    <main className="flex min-h-full items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">StockPyme</h1>

        {sessionExpired && (
          <Alert tone="warning" className="mb-6 text-center">
            <p>{SESSION_EXPIRED_MESSAGE}</p>
          </Alert>
        )}

        <ServerWakeUp>
          {/* LoginForm reads ?next=, which needs a Suspense boundary. */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </ServerWakeUp>
      </section>
    </main>
  );
}
