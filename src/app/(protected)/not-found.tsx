import Link from "next/link";

/** A protected route that does not exist, or a resource that is not there. */
export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-lg font-semibold">No encontramos lo que buscabas</h1>
      <p className="text-muted text-sm">
        La página o el recurso no existe, o ya no está disponible.
      </p>
      <Link href="/dashboard" className="text-primary text-sm underline">
        Volver al inicio
      </Link>
    </section>
  );
}
