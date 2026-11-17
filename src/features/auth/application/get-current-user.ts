import { UnauthorizedError } from "@/shared/domain/app-error";
import type { SessionTokenStore } from "@/shared/domain/session-token-store";

import type { AuthenticatedUser } from "../domain/authenticated-user";
import type { AuthRepository } from "../domain/auth.repository";

/**
 * Who is logged in, or null when nobody is. It answers null instead of throwing
 * because "there is no session" is an ordinary answer for a guard, not a
 * failure.
 *
 * A token that the API rejects is cleared on the way out, so an expired session
 * does not keep sending a dead token on every navigation.
 */
export class GetCurrentUser {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenStore: SessionTokenStore,
  ) {}

  async execute(): Promise<AuthenticatedUser | null> {
    const token = await this.tokenStore.read();
    if (token === null) return null;

    try {
      return await this.repository.profile();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        await this.tokenStore.clear();
        return null;
      }
      throw error;
    }
  }
}
