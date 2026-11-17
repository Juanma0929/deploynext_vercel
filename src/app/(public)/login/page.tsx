import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/presentation";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">StockPyme</h1>
        <p className="text-muted mt-1 text-sm">
          Ingresa con tu cuenta para administrar el inventario y las ventas.
        </p>
      </div>

      <div className="border-border bg-surface rounded-lg border p-5">
        <LoginForm />
      </div>
    </main>
  );
}
