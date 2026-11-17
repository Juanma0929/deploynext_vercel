/**
 * Reads the expiry of a JWT without verifying it.
 *
 * This is not authentication: the signature can only be checked by the API,
 * and it does so on every request. It only lets the proxy notice that a token
 * is past its hour and send the user to the login, instead of rendering a page
 * whose first request would answer 401.
 */
export function isTokenExpired(token: string, nowInSeconds: number): boolean {
  const exp = readExpiry(token);
  return exp === null || exp <= nowInSeconds;
}

function readExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (payload === undefined) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const claims: unknown = JSON.parse(atob(padded));

    if (typeof claims !== "object" || claims === null) return null;
    const { exp } = claims as { exp?: unknown };
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}
