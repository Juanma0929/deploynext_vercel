import { DomainError } from "@/shared/domain/errors";

import type { AuthRepository } from "../domain/auth.repository";
import { isValidTwoFactorCode, type LoginCredentials } from "../domain/credentials";
import { isValidEmail } from "@/shared/domain/email";
import type { SessionTokenStore } from "../domain/session-token.store";

/**
 * Logs in with email and password, plus the six-digit code when the account
 * has two-factor authentication, and keeps the access token.
 *
 * Invalid input is refused here, before any request. When the API asks for
 * the code it rejects with TwoFactorRequiredError, and the caller sends the
 * same credentials again with `code`.
 */
export class LoginUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenStore: SessionTokenStore,
  ) {}

  async execute(credentials: LoginCredentials): Promise<void> {
    const email = credentials.email.trim();

    if (!isValidEmail(email)) throw new DomainError("Ingresa un correo válido.");
    if (credentials.password.length === 0) throw new DomainError("Ingresa tu contraseña.");
    if (credentials.code !== undefined && !isValidTwoFactorCode(credentials.code)) {
      throw new DomainError("El código debe tener exactamente 6 dígitos.");
    }

    const token = await this.repository.login({ ...credentials, email });
    await this.tokenStore.save(token);
  }
}
