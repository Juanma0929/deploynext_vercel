import type { SessionTokenStore } from "../domain/session-token.store";

/**
 * Forgets the token on this browser only. Used when a login succeeded but the
 * profile could not be loaded, so no half-open session is left behind.
 */
export class LogoutLocallyUseCase {
  constructor(private readonly tokenStore: SessionTokenStore) {}

  execute(): Promise<void> {
    return this.tokenStore.clear();
  }
}
