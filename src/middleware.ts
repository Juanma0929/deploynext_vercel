import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/shared/infrastructure/http/token-storage";

const LOGIN = "/login";
const HOME = "/dashboard";

/**
 * The first gate: it only looks at whether there is a session cookie, which is
 * enough to keep an anonymous visitor out of the protected routes without
 * rendering them.
 *
 * It deliberately does not read the role out of the token. The role is asked to
 * GET /auth/profile, exactly as the API does, because a token says what it was
 * given and not what the user is allowed to do today.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(TOKEN_COOKIE) !== undefined;

  if (!hasSession && pathname !== LOGIN) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN;
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === LOGIN) {
    const url = request.nextUrl.clone();
    url.pathname = HOME;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything but the static assets and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
