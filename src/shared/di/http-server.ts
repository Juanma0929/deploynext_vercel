import { redirect } from "next/navigation";

import { expiredSessionLoginPath } from "@/shared/domain/session";
import { apiBaseUrl } from "@/shared/infrastructure/config/env";
import { FetchHttpClient, type HttpClient } from "@/shared/infrastructure/http";
import { ServerCookieTokenStorage } from "@/shared/infrastructure/http/server-cookie-token-storage";

/**
 * An HTTP client for the server: Server Components and generateMetadata.
 * The same interceptor as in the browser, with the token read from the cookie
 * of the request. A new one per call, because each request has its own token.
 *
 * `returnTo` is the page being rendered: on a 401 the user is redirected to
 * the login with the "session expired" notice and comes back there after
 * logging in. redirect() throws, so nothing after it runs.
 */
export function serverHttpClient(returnTo: string): HttpClient {
  return new FetchHttpClient({
    baseUrl: apiBaseUrl(),
    tokenStorage: new ServerCookieTokenStorage(),
    onSessionExpired: () => redirect(expiredSessionLoginPath(returnTo)),
    // The page shows the error itself; there is no app shell notice on the server.
    onForbidden: () => {},
  });
}
