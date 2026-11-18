import type { Role } from "@/shared/domain/role";

/** The API refuses shorter passwords (@MinLength(8)). */
export const PASSWORD_MIN_LENGTH = 8;

/** What POST /users receives. */
export interface NewUser {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: Role;
}

/**
 * What PATCH /users/:id may change. Only the fields present are sent. There
 * is no email: the API does not let it change.
 */
export interface UserChanges {
  readonly name?: string;
  readonly password?: string;
  readonly role?: Role;
  readonly isActive?: boolean;
}

export function hasChanges(changes: UserChanges): boolean {
  return Object.values(changes).some((value) => value !== undefined);
}
