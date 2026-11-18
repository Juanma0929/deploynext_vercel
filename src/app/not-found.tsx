import type { Metadata } from "next";

import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

/** Any address that is not a page of the app. */
export default function NotFound() {
  return (
    <main className="flex min-h-full items-center justify-center px-4">
      <StatusPage
        code="404"
        titleId="not-found-title"
        title="Esta página no existe"
        action={<ButtonLink href="/">Ir al inicio</ButtonLink>}
      >
        <p>Revisa la dirección, o vuelve al inicio para seguir desde el menú.</p>
      </StatusPage>
    </main>
  );
}
