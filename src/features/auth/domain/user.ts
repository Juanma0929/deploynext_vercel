import { DomainError } from "@/shared/domain/errors";

import { isValidEmail } from "./email";
import { can, canAccessRoute, type Permission } from "./permissions";
import { isRole, type Role } from "./role";

export interface UserProps {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}

/**
 * The logged-in user. It refuses to exist with an unknown role or an invalid
 * email, so the navigation is never built for a role the app does not know.
 */
export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;

  constructor(props: UserProps) {
    if (!isValidEmail(props.email)) {
      throw new DomainError("El correo del usuario no es válido.");
    }
    if (!isRole(props.role)) {
      throw new DomainError("El rol del usuario no es válido.");
    }

    this.id = props.id;
    this.name = props.name;
    this.email = props.email.trim();
    this.role = props.role;
    this.isActive = props.isActive;
    this.isTwoFactorEnabled = props.isTwoFactorEnabled;
  }

  get isAdmin(): boolean {
    return this.role === "admin";
  }

  can(permission: Permission): boolean {
    return can(this.role, permission);
  }

  canAccessRoute(pathname: string): boolean {
    return canAccessRoute(this.role, pathname);
  }
}
