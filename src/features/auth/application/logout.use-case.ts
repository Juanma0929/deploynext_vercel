import type { AuthRepository } from "../domain/auth.repository";
import type { SessionTokenStore } from "../domain/session-token.store";

/**
 * Ends the session. POST /auth/logout invalidates every token of the user, so
 * the user is logged out on every device, not only on this one.
 *
 * The token is cleared here even if the request fails (network down, token
 * already expired): the user asked to leave, and the browser must not keep a
 * session behind. It never rejects.
 */
export class LogoutUseCase {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenStore: SessionTokenStore,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.repository.logout();
    } catch {
      // Ignored on purpose: the local session ends either way.
    } finally {
      await this.tokenStore.clear();
    }
  }
}
