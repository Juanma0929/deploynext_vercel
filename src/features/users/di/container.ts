import { browserHttpClient } from "@/shared/di/http";

import { CreateUserUseCase } from "../application/create-user.use-case";
import { DeactivateUserUseCase } from "../application/deactivate-user.use-case";
import { ListUsersUseCase } from "../application/list-users.use-case";
import { ReactivateUserUseCase } from "../application/reactivate-user.use-case";
import { UpdateUserUseCase } from "../application/update-user.use-case";
import { UserHttpRepository } from "../infrastructure/user.http.repository";

export interface UsersContainer {
  readonly listUsers: ListUsersUseCase;
  readonly createUser: CreateUserUseCase;
  readonly updateUser: UpdateUserUseCase;
  readonly deactivateUser: DeactivateUserUseCase;
  readonly reactivateUser: ReactivateUserUseCase;
}

let container: UsersContainer | null = null;

/** The use cases of users for the browser, wired once. */
export function usersContainer(): UsersContainer {
  if (container !== null) return container;

  const repository = new UserHttpRepository(browserHttpClient());

  container = {
    listUsers: new ListUsersUseCase(repository),
    createUser: new CreateUserUseCase(repository),
    updateUser: new UpdateUserUseCase(repository),
    deactivateUser: new DeactivateUserUseCase(repository),
    reactivateUser: new ReactivateUserUseCase(repository),
  };
  return container;
}
