import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historial de ventas",
};

/** Admin only (sales:history); the app shell shows the access denied page to anyone else. */
export default function SalesHistoryPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Historial de ventas</h1>
      <p className="text-muted text-sm">Todas las ventas del negocio, de la más reciente a la más antigua.</p>
    </section>
  );
}
