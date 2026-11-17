import { NextResponse, type NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/shared/infrastructure/http/token-storage";

/** Routes that do not need a session. */
const PUBLIC_PATHS: ReadonlySet<string> = new Set(["/login"]);

/**
 * Protects the routes on the server (Next.js 16 renamed middleware.ts to
 * proxy.ts; the behaviour is the same).
 *
 * It only checks that the session cookie exists: it cannot tell whether the
 * token is still valid. If it expired, the first API call answers 401 and the
 * HTTP client clears the cookie and sends the user to /login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = (request.cookies.get(TOKEN_COOKIE)?.value ?? "") !== "";
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the assets of Next.js and files with an extension.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
