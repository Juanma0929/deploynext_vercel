import type { HttpClient } from "@/shared/infrastructure/http";

import type { ServerStatusRepository } from "../domain/server-status.repository";

/** A cold start on Render takes up to about a minute; this leaves room for it. */
const COLD_START_TIMEOUT_MS = 90_000;

export class ServerStatusHttpRepository implements ServerStatusRepository {
  constructor(private readonly http: HttpClient) {}

  async ping(): Promise<void> {
    await this.http.get<unknown>("/health", {
      signal: AbortSignal.timeout(COLD_START_TIMEOUT_MS),
    });
  }
}
