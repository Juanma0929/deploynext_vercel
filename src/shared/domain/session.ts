/**
 * How the app tells the login screen why the user landed there. Both the HTTP
 * interceptor (on a 401) and the proxy (on an expired token) send the user to
 * LOGIN_EXPIRED_PATH, and the login page shows SESSION_EXPIRED_MESSAGE.
 */
export const LOGIN_PATH = "/login";
export const HOME_PATH = "/dashboard";

export const SESSION_REASON_PARAM = "session";
export const SESSION_EXPIRED_REASON = "expired";

export const LOGIN_EXPIRED_PATH = `${LOGIN_PATH}?${SESSION_REASON_PARAM}=${SESSION_EXPIRED_REASON}`;

export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo.";

/** The API issues tokens that last one hour, with no refresh token. */
export const SESSION_LIFETIME_SECONDS = 60 * 60;
