import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/**
 * notFound() thrown by a protected page that has no not-found.tsx of its own.
 * It renders inside the app shell, so the menu stays.
 */
export default function ProtectedNotFound() {
  return (
    <StatusPage
      code="404"
      titleId="protected-not-found-title"
      title="No encontramos lo que buscas"
      action={<ButtonLink href="/">Volver al inicio</ButtonLink>}
    >
      <p>Puede que no exista o que se haya eliminado. Revisa el enlace.</p>
    </StatusPage>
  );
}
