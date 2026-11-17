import type { Role } from "../domain/role";

/**
 * How each role is named in the interface. It lives in presentation because it
 * is text the user reads, not a rule: the domain only knows "admin" and
 * "seller".
 */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  admin: "Administrador",
  seller: "Vendedor",
};
