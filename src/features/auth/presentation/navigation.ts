import type { Role } from "@/shared/domain/role";

import { can, type Permission } from "../domain/permissions";

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

interface GuardedItem extends NavigationItem {
  /** Null: every logged-in user sees it. */
  readonly permission: Permission | null;
}

/** The menu of the app. Which items a role sees comes from the permission matrix. */
const ITEMS: readonly GuardedItem[] = [
  { href: "/", label: "Inicio", permission: null },
  { href: "/ventas/nueva", label: "Nueva venta", permission: "sales:create" },
  { href: "/ventas", label: "Ventas de hoy", permission: "sales:read-today" },
  { href: "/productos", label: "Productos", permission: "products:read" },
  { href: "/proveedores", label: "Proveedores", permission: "suppliers:read" },
  { href: "/ventas/historial", label: "Historial de ventas", permission: "sales:history" },
  { href: "/reportes", label: "Reportes", permission: "reports:read" },
  { href: "/usuarios", label: "Usuarios", permission: "users:manage" },
];

export function navigationFor(role: Role): readonly NavigationItem[] {
  return ITEMS.filter((item) => item.permission === null || can(role, item.permission));
}

/**
 * The item of the menu that matches the page: the one with the longest href
 * that is the path or a parent of it, so /ventas/nueva lights "Nueva venta"
 * and not "Ventas de hoy" (/ventas).
 */
export function activeNavigationHref(
  items: readonly NavigationItem[],
  pathname: string,
): string | null {
  const matches = items.filter(
    (item) =>
      pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
  );
  return matches.reduce<string | null>(
    (best, item) => (best === null || item.href.length > best.length ? item.href : best),
    null,
  );
}
