import { SESSION_LIFETIME_SECONDS } from "@/shared/domain/session";

import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

/**
 * Keeps the token in a cookie of the browser. A cookie, and not localStorage,
 * because the proxy runs on the server and can only see cookies.
 *
 * The cookie lives as long as the token, one hour, so the browser drops it
 * when the session ends even if no request ever answers 401.
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
      `Max-Age=${SESSION_LIFETIME_SECONDS}`,
      "SameSite=Lax",
      ...(window.location.protocol === "https:" ? ["Secure"] : []),
    ].join("; ");
  }

  async clear(): Promise<void> {
    if (typeof document === "undefined") return;

    document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}
