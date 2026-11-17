import { UnauthorizedError } from "@/shared/domain/app-error";
import type { SessionTokenStore } from "@/shared/domain/session-token-store";

import { AuthenticatedUser } from "../domain/authenticated-user";
import type { AuthRepository } from "../domain/auth.repository";
import { Credentials } from "../domain/credentials";

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly twoFactorCode?: string;
}

/**
 * Logs in and leaves the session ready: the token is stored before the profile
 * is read, because the HTTP client needs it to authorise that second request.
 *
 * If the profile cannot be read the token is thrown away, so a half-open
 * session never survives: either there is a user or there is no session.
 */
export class LoginUser {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenStore: SessionTokenStore,
  ) {}

  async execute(input: LoginInput): Promise<AuthenticatedUser> {
    const credentials = new Credentials(input);
    const token = await this.repository.login(credentials);

    if (token.trim().length === 0) {
      throw new UnauthorizedError("El servidor no devolvió un token de sesión.");
    }

    await this.tokenStore.save(token);

    try {
      return await this.repository.profile();
    } catch (error) {
      await this.tokenStore.clear();
      throw error;
    }
  }
}
