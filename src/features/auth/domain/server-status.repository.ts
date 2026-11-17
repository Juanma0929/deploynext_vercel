/** The port to ask whether the API is up. */
export interface ServerStatusRepository {
  /** Resolves once the API answers; rejects if it does not. */
  ping(): Promise<void>;
}
