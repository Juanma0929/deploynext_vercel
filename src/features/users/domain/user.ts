import { isValidEmail } from "@/shared/domain/email";
import { DomainError } from "@/shared/domain/errors";
import { isRole, type Role } from "@/shared/domain/role";

export interface UserProps {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}

/** An account of the business, as the admin manages it. */
export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;

  constructor(props: UserProps) {
    if (props.name.trim() === "") throw new DomainError("El nombre del usuario es obligatorio.");
    if (!isValidEmail(props.email)) throw new DomainError("El correo del usuario no es válido.");
    if (!isRole(props.role)) throw new DomainError("El rol del usuario no es válido.");

    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email.trim();
    this.role = props.role;
    this.isActive = props.isActive;
    this.isTwoFactorEnabled = props.isTwoFactorEnabled;
  }
}
