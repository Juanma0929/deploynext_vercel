import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/** What a role sees when it opens a route it is not allowed into. */
export function AccessDenied() {
  return (
    <StatusPage
      code="403"
      titleId="access-denied-title"
      title="Acceso denegado"
      action={<ButtonLink href="/">Volver al inicio</ButtonLink>}
    >
      <p>
        Tu rol no tiene permiso para ver esta sección. Si crees que es un error, pídele a un
        administrador que revise tu cuenta.
      </p>
    </StatusPage>
  );
}
