import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Keeps the token in a cookie of the browser. A cookie, and not localStorage,
 * because middleware runs on the server and can only see cookies.
 *
 * On the server there is no document, so it reads as "no session".
 */
export class CookieTokenStorage implements TokenStorage {
  async read(): Promise<string | null> {
    if (typeof document === "undefined") return null;

    const prefix = `${TOKEN_COOKIE}=`;
    const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));

    return entry === undefined ? null : decodeURIComponent(entry.slice(prefix.length));
  }

  async save(token: string): Promise<void> {
    if (typeof document === "undefined") return;

    document.cookie = [
      `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
      "Path=/",
      `Max-Age=${ONE_DAY_IN_SECONDS}`,
      "SameSite=Lax",
      ...(window.location.protocol === "https:" ? ["Secure"] : []),
    ].join("; ");
  }

  async clear(): Promise<void> {
    if (typeof document === "undefined") return;

    document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}
