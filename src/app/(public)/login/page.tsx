import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm, ServerWakeUp } from "@/features/auth/presentation";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">StockPyme</h1>
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
