import { DomainError } from "@/shared/domain/app-error";

import type { Role } from "./role";

/**
 * The user as a plain object. Only plain objects cross the boundary between a
 * Server Component and a Client Component, so the session travels as a snapshot
 * and the entity is rebuilt on the other side.
 */
export interface AuthenticatedUserSnapshot {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}

interface AuthenticatedUserProps {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}

/**
 * The user behind the session. It cannot be built in an invalid state, so
 * anything that holds one knows the id, the email and the role are there.
 *
 * The role is read from the profile endpoint on every session and not from the
 * token, because that is how the API treats it: it reads the user from the
 * database on each request and never trusts the claim in the JWT.
 */
export class AuthenticatedUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;

  constructor(props: AuthenticatedUserProps) {
    if (props.id.trim().length === 0) {
      throw new DomainError("El usuario de la sesión no tiene identificador.");
    }
    if (props.email.trim().length === 0) {
      throw new DomainError("El usuario de la sesión no tiene correo.");
    }
    if (!props.isActive) {
      throw new DomainError("La cuenta está desactivada.");
    }

    this.id = props.id;
    this.name = props.name.trim().length > 0 ? props.name.trim() : props.email;
    this.email = props.email;
    this.role = props.role;
    this.isActive = props.isActive;
    this.isTwoFactorEnabled = props.isTwoFactorEnabled;
  }

  static fromSnapshot(snapshot: AuthenticatedUserSnapshot): AuthenticatedUser {
    return new AuthenticatedUser(snapshot);
  }

  toSnapshot(): AuthenticatedUserSnapshot {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      isTwoFactorEnabled: this.isTwoFactorEnabled,
    };
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  /** True when the user holds any of the roles a section requires. */
  hasAnyRole(roles: readonly Role[]): boolean {
    return roles.includes(this.role);
  }
}
