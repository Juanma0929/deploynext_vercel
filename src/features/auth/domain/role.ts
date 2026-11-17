/** The roles of StockPyme, spelled exactly as the API sends them. */
export const ROLES = ["admin", "seller"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
