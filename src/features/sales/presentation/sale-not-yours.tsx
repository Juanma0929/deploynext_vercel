import Link from "next/link";

/** What a seller sees when it opens the sale of another seller (the API answers 403). */
export function SaleNotYours() {
  return (
    <section
      aria-labelledby="sale-not-yours-title"
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      <p className="text-5xl font-bold text-slate-300" aria-hidden="true">
        403
      </p>
      <h1 id="sale-not-yours-title" className="text-xl font-semibold">
        Esta venta no es tuya
      </h1>
      <p className="text-muted text-sm">
        Solo puedes ver las ventas que registraste tú. Si necesitas revisarla, pídesela a un
        administrador.
      </p>
      <Link href="/ventas" className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white">
        Ver mis ventas de hoy
      </Link>
    </section>
  );
}
