import type { ServerStatusRepository } from "../domain/server-status.repository";

/**
 * Wakes the API up before the user tries to log in.
 *
 * The backend runs on the free plan of Render, which puts it to sleep after a
 * while without traffic; the first request then takes close to a minute. Asking
 * GET /health as soon as the login screen opens spends that wait while the user
 * is still typing, instead of on the login request.
 */
export class WakeUpServer {
  constructor(private readonly repository: ServerStatusRepository) {}

  execute(): Promise<void> {
    return this.repository.ping();
  }
}
