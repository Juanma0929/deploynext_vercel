import type { SessionTokenStore } from "@/shared/domain/session-token-store";

import type { AuthRepository } from "../domain/auth.repository";

/**
 * Logs out everywhere and clears the local session.
 *
 * The local token is cleared even when the request fails: if the network is
 * down or the token already expired, the user still asked to leave and the
 * session must not stay on this device.
 */
export class LogoutUser {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenStore: SessionTokenStore,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.repository.logout();
    } finally {
      await this.tokenStore.clear();
    }
  }
}
