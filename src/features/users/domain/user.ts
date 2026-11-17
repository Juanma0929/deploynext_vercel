import { DomainError } from "@/shared/domain/app-error";
import type { Role } from "@/shared/domain/role";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The API rejects anything shorter, so the form should too. */
export const MIN_PASSWORD_LENGTH = 8;

export interface UserSnapshot {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
}

/**
 * A user of the system as the administrator sees them.
 *
 * It is a different entity from the AuthenticatedUser of the auth feature on
 * purpose: this one can be inactive, because deactivated users are exactly what
 * this screen manages, while a session can never belong to one.
 */
export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;

  constructor(props: UserSnapshot) {
    if (props.id.trim().length === 0) {
      throw new DomainError("El usuario no tiene identificador.");
    }
    if (props.name.trim().length === 0) {
      throw new DomainError("El nombre es obligatorio.");
    }
    if (!EMAIL.test(props.email)) {
      throw new DomainError("El correo no tiene un formato válido.");
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email;
    this.role = props.role;
    this.isActive = props.isActive;
  }

  static fromSnapshot(snapshot: UserSnapshot): User {
    return new User(snapshot);
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
    };
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}

export interface NewUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: Role;
}

/**
 * The data needed to create a user, validated before it travels. The password
 * is only ever sent: it is never read back, because the API excludes it from
 * every answer.
 */
export class NewUser {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: Role;

  constructor(input: NewUserInput) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (name.length === 0) {
      throw new DomainError("El nombre es obligatorio.");
    }
    if (!EMAIL.test(email)) {
      throw new DomainError("El correo no tiene un formato válido.");
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `La contraseña debe tener al menos ${String(MIN_PASSWORD_LENGTH)} caracteres.`,
      );
    }

    this.name = name;
    this.email = email;
    this.password = input.password;
    this.role = input.role;
  }
}

/**
 * What can change about a user. The email is missing on purpose: the API does
 * not allow changing it, and an input that silently does nothing is worse than
 * no input.
 */
export interface UserChanges {
  readonly name?: string;
  readonly password?: string;
  readonly role?: Role;
  readonly isActive?: boolean;
}
