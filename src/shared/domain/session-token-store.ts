/**
 * Where the session token is kept. It is declared in the domain because the use
 * cases depend on it: logging in saves the token and logging out clears it.
 * The implementations (a cookie in the browser, the request headers on the
 * server) live in infrastructure.
 */
export interface SessionTokenStore {
  read(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}
