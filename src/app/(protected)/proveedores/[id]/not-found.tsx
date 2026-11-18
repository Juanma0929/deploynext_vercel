import Link from "next/link";

/** /proveedores/[id] with an id that does not exist, or that is not even a UUID. */
export default function SupplierNotFound() {
  return (
    <section
      aria-labelledby="supplier-not-found-title"
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      <p className="text-5xl font-bold text-slate-300" aria-hidden="true">
        404
      </p>
      <h1 id="supplier-not-found-title" className="text-xl font-semibold">
        Proveedor no encontrado
      </h1>
      <p className="text-muted text-sm">
        El proveedor que buscas no existe o fue eliminado. Revisa el enlace o búscalo en la lista.
      </p>
      <Link
        href="/proveedores"
        className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        Ver proveedores
      </Link>
    </section>
  );
}
