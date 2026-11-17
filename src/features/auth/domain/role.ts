import { DomainError } from "@/shared/domain/app-error";

/** The two roles of the API. The interface shows or hides by these. */
export const ROLES = ["admin", "seller"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function toRole(value: unknown): Role {
  if (!isRole(value)) {
    throw new DomainError(`El rol "${String(value)}" no existe.`);
  }
  return value;
}
