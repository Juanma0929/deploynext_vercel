import type { SessionTokenStore } from "@/shared/domain/session-token-store";

/**
 * The HTTP client asks this port for the token and never knows whether it came
 * from a cookie in the browser or from the request headers on the server. The
 * port itself is declared in the domain, so the use cases can depend on it too.
 */
export type TokenStorage = SessionTokenStore;

export const TOKEN_COOKIE = "stockpyme_token";
/** Eight hours, long enough for a shift and short enough to not linger. */
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8;
