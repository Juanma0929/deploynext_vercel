import { cookies } from "next/headers";

import { TOKEN_COOKIE, type TokenStorage } from "./token-storage";

/**
 * The server side of the token, for Server Components and route handlers. It
 * only reads: a Server Component cannot set a cookie, so logging in and out
 * stays in the browser.
 */
export class ServerTokenStorage implements TokenStorage {
  async read(): Promise<string | null> {
    const store = await cookies();
    return store.get(TOKEN_COOKIE)?.value ?? null;
  }

  async save(): Promise<void> {
    throw new Error("The token cannot be written from the server.");
  }

  async clear(): Promise<void> {
    throw new Error("The token cannot be cleared from the server.");
  }
}
