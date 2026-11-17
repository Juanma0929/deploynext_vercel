import { AppError } from "@/shared/domain/errors";

/**
 * The password was right, but the account has two-factor authentication: the
 * login has to be sent again with the six-digit code.
 */
export class TwoFactorRequiredError extends AppError {
  constructor() {
    super("Ingresa el código de 6 dígitos de tu app de autenticación.");
    this.name = "TwoFactorRequiredError";
  }
}

/** Wrong email or password, or an inactive user: the API does not tell them apart. */
export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Correo o contraseña incorrectos.");
    this.name = "InvalidCredentialsError";
  }
}

/** The six-digit code did not match the authenticator app. */
export class InvalidTwoFactorCodeError extends AppError {
  constructor() {
    super("El código de verificación no es válido. Intenta con el código actual.");
    this.name = "InvalidTwoFactorCodeError";
  }
}
