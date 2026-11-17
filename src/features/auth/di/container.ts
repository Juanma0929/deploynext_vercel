import { env } from "@/shared/infrastructure/config/env";
import { CookieTokenStorage, FetchHttpClient } from "@/shared/infrastructure/http";

import { GetCurrentUser } from "../application/get-current-user";
import { LoginUser } from "../application/login-user";
import { LogoutUser } from "../application/logout-user";
import { AuthHttpRepository } from "../infrastructure/auth.http.repository";

export interface AuthContainer {
  readonly loginUser: LoginUser;
  readonly logoutUser: LogoutUser;
  readonly getCurrentUser: GetCurrentUser;
}

/**
 * The browser container: the only place where the concrete repository, the
 * cookie storage and the use cases are built. The facade hook asks for this and
 * no component ever constructs one of these by hand.
 *
 * It is built once per page load and shared, because the HTTP client and the
 * storage hold no per-request state.
 */
let container: AuthContainer | null = null;

export function authContainer(): AuthContainer {
  if (container !== null) return container;

  const tokenStore = new CookieTokenStorage();
  const repository = new AuthHttpRepository(new FetchHttpClient(env.apiUrl, tokenStore));

  container = {
    loginUser: new LoginUser(repository, tokenStore),
    logoutUser: new LogoutUser(repository, tokenStore),
    getCurrentUser: new GetCurrentUser(repository, tokenStore),
  };

  return container;
}
