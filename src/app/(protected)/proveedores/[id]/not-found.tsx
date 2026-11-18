import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/** /proveedores/[id] with an id that does not exist, or that is not even a UUID. */
export default function SupplierNotFound() {
  return (
    <StatusPage
      code="404"
      titleId="supplier-not-found-title"
      title="Proveedor no encontrado"
      action={<ButtonLink href="/proveedores">Ver proveedores</ButtonLink>}
    >
      <p>El proveedor que buscas no existe o fue eliminado. Revisa el enlace o búscalo en la lista.</p>
    </StatusPage>
  );
}
