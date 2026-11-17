import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Inicio</h1>
      <p className="text-muted text-sm">Bienvenido a StockPyme.</p>
    </section>
  );
}
