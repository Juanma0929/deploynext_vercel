import Link from "next/link";

/** What a role sees when it opens a route it is not allowed into. */
export function AccessDenied() {
  return (
    <section
      aria-labelledby="access-denied-title"
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      <p className="text-5xl font-bold text-slate-300" aria-hidden="true">
        403
      </p>
      <h1 id="access-denied-title" className="text-xl font-semibold">
        Acceso denegado
      </h1>
      <p className="text-muted text-sm">
        Tu rol no tiene permiso para ver esta sección. Si crees que es un error, pídele a un
        administrador que revise tu cuenta.
      </p>
      <Link
        href="/"
        className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
