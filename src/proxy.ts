import { NextResponse, type NextRequest } from "next/server";

import {
  HOME_PATH,
  LOGIN_PATH,
  NEXT_PARAM,
  SESSION_EXPIRED_REASON,
  SESSION_REASON_PARAM,
} from "@/shared/domain/session";
import { TOKEN_COOKIE, isTokenExpired } from "@/shared/infrastructure/http";

/** Routes that do not need a session. */
const PUBLIC_PATHS: ReadonlySet<string> = new Set([LOGIN_PATH]);

/**
 * Protects the routes on the server (Next.js 16 renamed middleware.ts to
 * proxy.ts; the behaviour is the same).
 *
 * - Without a token, every route but /login redirects to /login, keeping the
 *   page that was asked for in ?next= so the login can return there.
 * - With a token that is past its hour (there is no refresh), the cookie is
 *   deleted and the user is sent to /login with the "your session expired"
 *   notice.
 * - With a valid token, /login redirects to the home page.
 *
 * It only reads the expiry of the token. Its signature and the role are the
 * business of the API, which checks both on every request; if the API rejects
 * a token anyway, the HTTP client gets a 401 and does the same as here.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname);
  const token = request.cookies.get(TOKEN_COOKIE)?.value ?? "";

  if (token === "") {
    return isPublic ? NextResponse.next() : redirectToLogin(request, pathname, search, false);
  }

  if (isTokenExpired(token, Math.floor(Date.now() / 1000))) {
    const response = isPublic
      ? NextResponse.next()
      : redirectToLogin(request, pathname, search, true);
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  return isPublic ? NextResponse.redirect(new URL(HOME_PATH, request.url)) : NextResponse.next();
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  search: string,
  expired: boolean,
): NextResponse {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  if (expired) loginUrl.searchParams.set(SESSION_REASON_PARAM, SESSION_EXPIRED_REASON);
  if (pathname !== HOME_PATH) loginUrl.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except the assets of Next.js and files with an extension.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
