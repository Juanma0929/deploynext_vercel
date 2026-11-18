import { cookies } from "next/headers";

import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

/**
 * Reads the token from the cookie of the request, so Server Components and
 * generateMetadata can call the API as the logged-in user.
 *
 * It is not exported from ./index on purpose: next/headers only exists on the
 * server, and the index is imported by browser code too.
 *
 * Server Components cannot write cookies, so save() and clear() do nothing.
 * The cookie is written by the browser on login and deleted by the proxy when
 * the token expires.
 */
export class ServerCookieTokenStorage implements TokenStorage {
  async read(): Promise<string | null> {
    const value = (await cookies()).get(TOKEN_COOKIE)?.value ?? "";
    return value === "" ? null : value;
  }

  async save(): Promise<void> {}

  async clear(): Promise<void> {}
}
