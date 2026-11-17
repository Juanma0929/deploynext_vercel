import { DomainError } from "@/shared/domain/app-error";

// Deliberately simple: the API has the last word on what a valid email is.
// This only catches what the user can see is wrong before spending a request.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TWO_FACTOR_CODE = /^\d{6}$/;

interface CredentialsInput {
  readonly email: string;
  readonly password: string;
  /** Six digits from the authenticator app, only for users with 2FA enabled. */
  readonly twoFactorCode?: string;
}

/**
 * What the user types to log in. Validating it here means the login form and
 * any future caller get the same rules, and the messages are the ones shown in
 * the interface.
 */
export class Credentials {
  readonly email: string;
  readonly password: string;
  readonly twoFactorCode: string | undefined;

  constructor(input: CredentialsInput) {
    const email = input.email.trim().toLowerCase();
    const code = input.twoFactorCode?.trim();

    if (email.length === 0) {
      throw new DomainError("El correo es obligatorio.");
    }
    if (!EMAIL.test(email)) {
      throw new DomainError("El correo no tiene un formato válido.");
    }
    if (input.password.length === 0) {
      throw new DomainError("La contraseña es obligatoria.");
    }
    if (code !== undefined && code.length > 0 && !TWO_FACTOR_CODE.test(code)) {
      throw new DomainError("El código de verificación debe tener 6 dígitos.");
    }

    this.email = email;
    this.password = input.password;
    this.twoFactorCode = code !== undefined && code.length > 0 ? code : undefined;
  }
}
