import { env } from "@/shared/infrastructure/config/env";
import { CookieTokenStorage, FetchHttpClient } from "@/shared/infrastructure/http";

import {
  ChangeUserRole,
  CreateUser,
  GetUser,
  ListUsers,
  SetUserActive,
} from "../application/manage-users";
import { UserHttpRepository } from "../infrastructure/user.http.repository";

export interface UsersContainer {
  readonly listUsers: ListUsers;
  readonly getUser: GetUser;
  readonly createUser: CreateUser;
  readonly changeUserRole: ChangeUserRole;
  readonly setUserActive: SetUserActive;
}

/** The only place where the users repository and its use cases are built. */
let container: UsersContainer | null = null;

export function usersContainer(): UsersContainer {
  if (container !== null) return container;

  const repository = new UserHttpRepository(
    new FetchHttpClient(env.apiUrl, new CookieTokenStorage()),
  );

  container = {
    listUsers: new ListUsers(repository),
    getUser: new GetUser(repository),
    createUser: new CreateUser(repository),
    changeUserRole: new ChangeUserRole(repository),
    setUserActive: new SetUserActive(repository),
  };

  return container;
}
