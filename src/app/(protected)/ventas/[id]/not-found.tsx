import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/** /ventas/[id] with an id that does not exist, or that is not even a UUID. */
export default function SaleNotFound() {
  return (
    <StatusPage
      code="404"
      titleId="sale-not-found-title"
      title="Venta no encontrada"
      action={<ButtonLink href="/ventas">Ver ventas de hoy</ButtonLink>}
    >
      <p>La venta que buscas no existe. Revisa el enlace.</p>
    </StatusPage>
  );
}
