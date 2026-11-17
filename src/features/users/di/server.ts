import { env } from "@/shared/infrastructure/config/env";
import { FetchHttpClient } from "@/shared/infrastructure/http";
import { ServerTokenStorage } from "@/shared/infrastructure/http/server-token-storage";

import { ListUsers } from "../application/manage-users";
import type { User } from "../domain/user";
import { UserHttpRepository } from "../infrastructure/user.http.repository";

/**
 * The list of users as the server reads it, for the route that renders the
 * screen. A new container per request, because the token comes from the
 * cookies of that request.
 *
 * Loading here instead of in an effect means the page arrives with its data:
 * no spinner on the first paint and no second round trip from the browser.
 */
export async function listUsersOnServer(): Promise<User[]> {
  const repository = new UserHttpRepository(
    new FetchHttpClient(env.apiUrl, new ServerTokenStorage()),
  );

  return new ListUsers(repository).execute();
}
