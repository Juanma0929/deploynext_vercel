import { LOGIN_EXPIRED_PATH, LOGIN_PATH } from "@/shared/domain/session";
import { apiBaseUrl } from "@/shared/infrastructure/config/env";
import {
  CookieTokenStorage,
  FetchHttpClient,
  type HttpClient,
  type TokenStorage,
} from "@/shared/infrastructure/http";

let tokenStorage: TokenStorage | null = null;
let httpClient: HttpClient | null = null;

/** The token storage of the browser, shared by the HTTP client and auth. */
export function browserTokenStorage(): TokenStorage {
  tokenStorage ??= new CookieTokenStorage();
  return tokenStorage;
}

/**
 * The single HTTP client of the browser. The di/ of each feature passes it to
 * its HTTP repositories; nothing else creates one.
 *
 * The token lasts one hour and there is no refresh, so a 401 means the session
 * is over. The client has already cleared the token; this sends the user to the
 * login with the "your session expired" notice, with a full page load so every
 * in-memory store of every feature starts over empty. It replaces the history
 * entry, so "back" does not return to the protected page.
 */
export function browserHttpClient(): HttpClient {
  httpClient ??= new FetchHttpClient({
    baseUrl: apiBaseUrl(),
    tokenStorage: browserTokenStorage(),
    onSessionExpired: () => {
      if (window.location.pathname !== LOGIN_PATH) window.location.replace(LOGIN_EXPIRED_PATH);
    },
  });
  return httpClient;
}
