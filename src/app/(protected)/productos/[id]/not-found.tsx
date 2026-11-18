import { INVENTORY_PATH } from "@/features/products/presentation";
import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/** /productos/[id] with an id that does not exist, or that is not even a UUID. */
export default function ProductNotFound() {
  return (
    <StatusPage
      code="404"
      titleId="product-not-found-title"
      title="Producto no encontrado"
      action={<ButtonLink href={INVENTORY_PATH}>Ver productos</ButtonLink>}
    >
      <p>El producto que buscas no existe o fue eliminado. Revisa el enlace o búscalo en el inventario.</p>
    </StatusPage>
  );
}
