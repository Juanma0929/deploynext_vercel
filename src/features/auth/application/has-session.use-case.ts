import type { SessionTokenStore } from "../domain/session-token.store";

/** Whether a token is stored, so a reload can restore the session. */
export class HasSessionUseCase {
  constructor(private readonly tokenStore: SessionTokenStore) {}

  async execute(): Promise<boolean> {
    return (await this.tokenStore.read()) !== null;
  }
}
