import type { Metadata } from "next";

import { ServerWakeUp } from "@/features/auth/presentation";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">StockPyme</h1>
        <ServerWakeUp>
          <p className="text-muted text-center text-sm">Servidor disponible.</p>
        </ServerWakeUp>
      </section>
    </main>
  );
}
