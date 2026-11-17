/**
 * Where the JWT lives. The HTTP client asks this port for the token and never
 * knows whether it came from a cookie in the browser or from the request
 * headers on the server.
 */
export interface TokenStorage {
  read(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}

export const TOKEN_COOKIE = "stockpyme_token";
/** Eight hours, long enough for a shift and short enough to not linger. */
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8;
