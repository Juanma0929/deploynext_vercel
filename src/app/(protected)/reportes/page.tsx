import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes",
};

/** Admin only (reports:read); the app shell shows the access denied page to anyone else. */
export default function ReportsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Reportes</h1>
      <p className="text-muted text-sm">Ventas por periodo, productos más vendidos y stock bajo.</p>
    </section>
  );
}
