import type { Role } from "@/shared/domain/role";

/**
 * Everything the interface can show or hide. Each one mirrors the @Roles() of
 * the endpoints behind it in the API, so the interface never offers an action
 * that would answer 403.
 */
export const PERMISSIONS = [
  "products:read",
  "products:write",
  "suppliers:read",
  "suppliers:write",
  "sales:create",
  "sales:read-today",
  "sales:history",
  "sales:cancel",
  "reports:read",
  "users:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * The matrix of the app. An admin can do everything; a seller can sell, see
 * its own sales of the day and look up products and suppliers, but never
 * change the catalogue, cancel a sale, see the history, the reports or the
 * users.
 */
const MATRIX: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  admin: new Set(PERMISSIONS),
  seller: new Set<Permission>([
    "products:read",
    "suppliers:read",
    "sales:create",
    "sales:read-today",
  ]),
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[role].has(permission);
}

/** A route of the app and the permission needed to open it. */
interface RouteRule {
  readonly pattern: RegExp;
  readonly permission: Permission;
}

/**
 * The routes that are blocked, not only hidden: opening one of them by URL
 * without the permission shows the access denied page. The first rule that
 * matches decides, so the specific ones go first.
 */
const ROUTE_RULES: readonly RouteRule[] = [
  { pattern: /^\/usuarios(\/|$)/, permission: "users:manage" },
  { pattern: /^\/reportes(\/|$)/, permission: "reports:read" },
  { pattern: /^\/ventas\/historial(\/|$)/, permission: "sales:history" },
  { pattern: /^\/ventas\/nueva\/?$/, permission: "sales:create" },
  { pattern: /^\/productos\/nuevo\/?$/, permission: "products:write" },
  { pattern: /^\/productos\/[^/]+\/editar\/?$/, permission: "products:write" },
  { pattern: /^\/productos(\/|$)/, permission: "products:read" },
  { pattern: /^\/proveedores\/nuevo\/?$/, permission: "suppliers:write" },
  { pattern: /^\/proveedores\/[^/]+\/editar\/?$/, permission: "suppliers:write" },
  { pattern: /^\/proveedores(\/|$)/, permission: "suppliers:read" },
];

/** The permission a route needs, or null when any logged-in user may open it. */
export function permissionForRoute(pathname: string): Permission | null {
  return ROUTE_RULES.find((rule) => rule.pattern.test(pathname))?.permission ?? null;
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  const permission = permissionForRoute(pathname);
  return permission === null || can(role, permission);
}
