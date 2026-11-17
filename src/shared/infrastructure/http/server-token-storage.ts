import { cookies } from "next/headers";

import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

/**
 * The server side of the token, for Server Components and route handlers.
 *
 * It only reads. A Server Component cannot write a cookie, so saving and
 * clearing are no-ops rather than errors: the use cases call clear() when the
 * API rejects a token, and on the server the right answer to that is to let the
 * guard redirect to the login page, where the browser replaces the cookie.
 * Logging in and out happen in the browser, with CookieTokenStorage.
 */
export class ServerTokenStorage implements TokenStorage {
  async read(): Promise<string | null> {
    const store = await cookies();
    return store.get(TOKEN_COOKIE)?.value ?? null;
  }

  async save(): Promise<void> {
    // Not possible from a Server Component. See the note above.
  }

  async clear(): Promise<void> {
    // Not possible from a Server Component. See the note above.
  }
}
