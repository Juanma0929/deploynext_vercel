import { NextResponse, type NextRequest } from "next/server";

import { HOME_PATH, LOGIN_EXPIRED_PATH, LOGIN_PATH } from "@/shared/domain/session";
import { TOKEN_COOKIE, isTokenExpired } from "@/shared/infrastructure/http";

/**
 * The first gate of the app (Next.js 16 renamed middleware.ts to proxy.ts).
 *
 * - Without a token, every route but /login redirects to /login.
 * - With a token that is past its hour, the cookie is deleted and the user is
 *   sent to /login with the "your session expired" notice.
 * - With a valid token, /login redirects to /dashboard.
 *
 * It only reads the cookie. The role and the signature of the token are the
 * business of the API, which checks both on every request.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (token === undefined || token === "") {
    return isLogin ? NextResponse.next() : redirect(request, LOGIN_PATH);
  }

  if (isTokenExpired(token, Math.floor(Date.now() / 1000))) {
    const response = isLogin ? NextResponse.next() : redirect(request, LOGIN_EXPIRED_PATH);
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  return isLogin ? redirect(request, HOME_PATH) : NextResponse.next();
}

function redirect(request: NextRequest, target: string): NextResponse {
  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  // Everything but the assets that Next.js serves and the files in public/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
