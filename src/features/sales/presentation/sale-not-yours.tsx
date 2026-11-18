import { ButtonLink, StatusPage } from "@/shared/presentation/ui";

/** What a seller sees when it opens the sale of another seller (the API answers 403). */
export function SaleNotYours() {
  return (
    <StatusPage
      code="403"
      titleId="sale-not-yours-title"
      title="Esta venta no es tuya"
      action={<ButtonLink href="/ventas">Ver mis ventas de hoy</ButtonLink>}
    >
      <p>
        Solo puedes ver las ventas que registraste tú. Si necesitas revisarla, pídesela a un
        administrador.
      </p>
    </StatusPage>
  );
}
