import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold">StockPyme</h1>
      <p className="text-muted text-sm">
        Inventario, ventas y reportes. Inicia sesión para continuar.
      </p>
    </main>
  );
}
