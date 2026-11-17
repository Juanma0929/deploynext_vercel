import type { AuthenticatedUser } from "./authenticated-user";
import type { Credentials } from "./credentials";

/**
 * The port the use cases talk to. Its implementation lives in infrastructure
 * and is the only thing that knows there is an HTTP API behind it.
 */
export interface AuthRepository {
  /** Returns the access token. Throws UnauthorizedError on bad credentials. */
  login(credentials: Credentials): Promise<string>;
  /** The logged-in user, read from the API on every session. */
  profile(): Promise<AuthenticatedUser>;
  /** Invalidates every token issued to the user so far. */
  logout(): Promise<void>;
}
