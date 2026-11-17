import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Keeps the token in memory and in a cookie of the browser.
 *
 * Memory is what every request reads, so the cookie is parsed once per page
 * load. The cookie, and not localStorage, is what survives a reload, and it is
 * what middleware (proxy.ts) sees on the server to protect the routes. It is
 * not httpOnly because the backend does not use cookies: the frontend writes it.
 *
 * On the server there is no document, so it reads as "no session".
 */
export class CookieTokenStorage implements TokenStorage {
  /** undefined: the cookie was not read yet; null: there is no session. */
  private token: string | null | undefined = undefined;

  async read(): Promise<string | null> {
    if (typeof document === "undefined") return null;

    this.token ??= readCookie();
    return this.token;
  }

  async save(token: string): Promise<void> {
    if (typeof document === "undefined") return;

    this.token = token;
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

    this.token = null;
    document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

function readCookie(): string | null {
  const prefix = `${TOKEN_COOKIE}=`;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return entry === undefined ? null : decodeURIComponent(entry.slice(prefix.length));
}
