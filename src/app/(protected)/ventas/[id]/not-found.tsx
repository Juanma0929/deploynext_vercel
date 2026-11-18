import Link from "next/link";

/** /ventas/[id] with an id that does not exist, or that is not even a UUID. */
export default function SaleNotFound() {
  return (
    <section
      aria-labelledby="sale-not-found-title"
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      <p className="text-5xl font-bold text-slate-300" aria-hidden="true">
        404
      </p>
      <h1 id="sale-not-found-title" className="text-xl font-semibold">
        Venta no encontrada
      </h1>
      <p className="text-muted text-sm">La venta que buscas no existe. Revisa el enlace.</p>
      <Link href="/ventas" className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white">
        Ver ventas de hoy
      </Link>
    </section>
  );
}
