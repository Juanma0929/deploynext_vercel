/** The name of the cookie that holds the JWT, so middleware can read it too. */
export const TOKEN_COOKIE = "stockpyme_token";

/** Where the session token lives. Async so a server implementation fits too. */
export interface TokenStorage {
  read(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}
