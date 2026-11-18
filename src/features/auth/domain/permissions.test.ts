import { describe, expect, it } from "vitest";

import { can, canAccessRoute, PERMISSIONS, permissionForRoute, type Permission } from "./permissions";

/** What a seller may do; everything else is admin only. */
const SELLER: readonly Permission[] = [
  "products:read",
  "suppliers:read",
  "sales:create",
  "sales:read-today",
  "sales:charge",
];

describe("permission matrix", () => {
  it.each(PERMISSIONS)("an admin has %s", (permission) => {
    expect(can("admin", permission)).toBe(true);
  });

  it.each(PERMISSIONS)("a seller has %s only if it is one of its permissions", (permission) => {
    expect(can("seller", permission)).toBe(SELLER.includes(permission));
  });

  it("a seller never changes the catalogue, cancels, or sees history, reports or users", () => {
    const adminOnly: readonly Permission[] = [
      "products:write",
      "suppliers:write",
      "sales:cancel",
      "sales:history",
      "sales:read-all",
      "reports:read",
      "users:manage",
    ];
    for (const permission of adminOnly) expect(can("seller", permission)).toBe(false);
  });
});

describe("routes of the matrix", () => {
  it.each([
    ["/usuarios", "users:manage"],
    ["/reportes/ventas", "reports:read"],
    ["/ventas/historial", "sales:history"],
    ["/ventas/nueva", "sales:create"],
    ["/ventas/abc/cobrar", "sales:charge"],
    ["/ventas", "sales:read-today"],
    ["/productos/nuevo", "products:write"],
    ["/productos/abc/editar", "products:write"],
    ["/productos/abc", "products:read"],
    ["/proveedores/nuevo", "suppliers:write"],
    ["/proveedores/abc/editar", "suppliers:write"],
    ["/proveedores", "suppliers:read"],
  ] as const)("%s needs %s", (path, permission) => {
    expect(permissionForRoute(path)).toBe(permission);
  });

  it("the home page needs no permission", () => {
    expect(permissionForRoute("/")).toBeNull();
  });

  it("does not confuse a route with another that only starts the same", () => {
    expect(permissionForRoute("/usuarios-viejos")).toBeNull();
  });

  it("blocks a seller from admin routes but lets it sell and charge", () => {
    expect(canAccessRoute("seller", "/usuarios")).toBe(false);
    expect(canAccessRoute("seller", "/reportes")).toBe(false);
    expect(canAccessRoute("seller", "/ventas/historial")).toBe(false);
    expect(canAccessRoute("seller", "/productos/nuevo")).toBe(false);
    expect(canAccessRoute("seller", "/ventas/nueva")).toBe(true);
    expect(canAccessRoute("seller", "/ventas/abc/cobrar")).toBe(true);
    expect(canAccessRoute("seller", "/productos/abc")).toBe(true);
    expect(canAccessRoute("admin", "/usuarios")).toBe(true);
  });
});
