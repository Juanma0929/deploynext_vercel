import { LOGIN_PATH, expiredSessionLoginPath } from "@/shared/domain/session";
import { apiBaseUrl } from "@/shared/infrastructure/config/env";
import {
  CookieTokenStorage,
  FetchHttpClient,
  type HttpClient,
  type TokenStorage,
} from "@/shared/infrastructure/http";

let tokenStorage: TokenStorage | null = null;
let httpClient: HttpClient | null = null;

export type ForbiddenListener = () => void;
const forbiddenListeners = new Set<ForbiddenListener>();

/** The token storage of the browser, shared by the HTTP client and auth. */
export function browserTokenStorage(): TokenStorage {
  tokenStorage ??= new CookieTokenStorage();
  return tokenStorage;
}

/**
 * Subscribes to every 403 the API answers, whoever made the request. The app
 * shell uses it to show a notice. Returns the function that unsubscribes.
 */
export function onForbiddenResponse(listener: ForbiddenListener): () => void {
  forbiddenListeners.add(listener);
  return () => {
    forbiddenListeners.delete(listener);
  };
}

/**
 * The single HTTP client of the browser. The di/ of each feature passes it to
 * its HTTP repositories; nothing else creates one.
 *
 * The token lasts one hour and there is no refresh, so a 401 means the session
 * is over. The client has already cleared the token; this sends the user to the
 * login with the "your session expired" notice (and ?next= to come back to the
 * same page after logging in again), with a full page load so every
 * in-memory store of every feature starts over empty. It replaces the history
 * entry, so "back" does not return to the protected page.
 *
 * A 403 is passed to every subscriber of onForbiddenResponse.
 */
export function browserHttpClient(): HttpClient {
  httpClient ??= new FetchHttpClient({
    baseUrl: apiBaseUrl(),
    tokenStorage: browserTokenStorage(),
    onSessionExpired: () => {
      const { pathname, search } = window.location;
      if (pathname !== LOGIN_PATH) {
        window.location.replace(expiredSessionLoginPath(`${pathname}${search}`));
      }
    },
    onForbidden: () => {
      for (const listener of forbiddenListeners) listener();
    },
  });
  return httpClient;
}
