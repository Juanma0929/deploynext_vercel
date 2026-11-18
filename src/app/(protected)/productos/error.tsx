"use client";

import { Button, StatusPage } from "@/shared/presentation/ui";

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
    <StatusPage
      role="alert"
      titleId="products-error-title"
      title="No se pudo cargar el inventario"
      action={<Button onClick={retry}>Reintentar</Button>}
    >
      <p>El servidor no respondió como esperábamos. Revisa tu conexión e inténtalo de nuevo.</p>
    </StatusPage>
  );
}
