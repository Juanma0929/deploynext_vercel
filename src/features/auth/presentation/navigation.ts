import type { Role } from "../domain/role";

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

interface RestrictedItem extends NavigationItem {
  readonly roles: readonly Role[];
}

/** Mirrors the @Roles() of the API: a seller only sees what it may use. */
const ITEMS: readonly RestrictedItem[] = [
  { href: "/", label: "Inicio", roles: ["admin", "seller"] },
  { href: "/products", label: "Productos", roles: ["admin", "seller"] },
  { href: "/sales", label: "Ventas", roles: ["admin", "seller"] },
  { href: "/suppliers", label: "Proveedores", roles: ["admin", "seller"] },
  { href: "/reports", label: "Reportes", roles: ["admin"] },
  { href: "/users", label: "Usuarios", roles: ["admin"] },
];

export function navigationFor(role: Role): readonly NavigationItem[] {
  return ITEMS.filter((item) => item.roles.includes(role));
}

export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  admin: "Administrador",
  seller: "Vendedor",
};
