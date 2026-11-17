import { TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS, type TokenStorage } from "./token-storage";

/**
 * The browser side of the token. It is a cookie and not localStorage because
 * the Server Components and the middleware have to read it too: a token in
 * localStorage is invisible to the server and the protected routes could only
 * be guarded after hydration.
 */
export class CookieTokenStorage implements TokenStorage {
  async read(): Promise<string | null> {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${TOKEN_COOKIE}=`));
    if (match === undefined) return null;
    const value = match.slice(TOKEN_COOKIE.length + 1);
    return value.length > 0 ? decodeURIComponent(value) : null;
  }

  async save(token: string): Promise<void> {
    if (typeof document === "undefined") return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}` +
      `; SameSite=Lax${secure}`;
  }

  async clear(): Promise<void> {
    if (typeof document === "undefined") return;
    document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}
