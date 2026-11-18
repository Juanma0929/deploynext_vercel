"use client";

interface ProductsErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/**
 * Shown when the inventory could not be loaded. In production the message of
 * a server error does not reach the browser, so the text is our own.
 */
export default function ProductsError({ retry }: ProductsErrorProps) {
  return (
    <section role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">No se pudo cargar el inventario</h1>
      <p className="text-muted text-sm">
        El servidor no respondió como esperábamos. Revisa tu conexión e inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={retry}
        className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        Reintentar
      </button>
    </section>
  );
}
