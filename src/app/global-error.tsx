"use client";

import "./globals.css";

interface GlobalErrorProps {
  readonly error: unknown;
  readonly retry: () => void;
}

/**
 * The last boundary: an error in the root layout itself. It replaces the whole
 * document, so it brings its own <html>, <body> and styles, and it cannot use
 * the providers of the app (no toasts, no session).
 */
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="antialiased">
        <title>Error · StockPyme</title>
        <main
          role="alert"
          className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center"
        >
          <h1 className="text-xl font-semibold">La aplicación tuvo un problema</h1>
          <p className="text-muted text-sm">Inténtalo de nuevo. Si sigue pasando, recarga la página.</p>
          <button
            type="button"
            onClick={retry}
            className="bg-primary mt-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
