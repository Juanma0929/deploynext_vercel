/**
 * How the app tells the login screen why the user landed there. Both the HTTP
 * interceptor (on a 401) and the proxy (on an expired token) send the user to
 * /login?session=expired, and the login page shows SESSION_EXPIRED_MESSAGE.
 */
export const LOGIN_PATH = "/login";
export const HOME_PATH = "/";

/** The page to return to after logging in. */
export const NEXT_PARAM = "next";

export const SESSION_REASON_PARAM = "session";
export const SESSION_EXPIRED_REASON = "expired";

export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo.";

/** The API issues tokens that last one hour, with no refresh token. */
export const SESSION_LIFETIME_SECONDS = 60 * 60;

/** /login?session=expired, plus ?next= when there is a page to return to. */
export function expiredSessionLoginPath(returnTo: string): string {
  const params = new URLSearchParams({ [SESSION_REASON_PARAM]: SESSION_EXPIRED_REASON });
  if (returnTo !== HOME_PATH && returnTo !== LOGIN_PATH) params.set(NEXT_PARAM, returnTo);
  return `${LOGIN_PATH}?${params.toString()}`;
}
