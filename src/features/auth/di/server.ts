import { env } from "@/shared/infrastructure/config/env";
import { FetchHttpClient } from "@/shared/infrastructure/http";
import { ServerTokenStorage } from "@/shared/infrastructure/http/server-token-storage";

import { GetCurrentUser } from "../application/get-current-user";
import type { AuthenticatedUser } from "../domain/authenticated-user";
import { AuthHttpRepository } from "../infrastructure/auth.http.repository";

/**
 * The session as the server sees it, for the layouts and pages that guard a
 * route. A new container per request, because the token comes from the cookies
 * of that request.
 *
 * This is what lets the protected area be a Server Component: the guard runs
 * before anything is sent to the browser, so a user without a session never
 * receives the page at all.
 */
export async function getServerSession(): Promise<AuthenticatedUser | null> {
  const tokenStore = new ServerTokenStorage();
  const repository = new AuthHttpRepository(new FetchHttpClient(env.apiUrl, tokenStore));

  return new GetCurrentUser(repository, tokenStore).execute();
}
