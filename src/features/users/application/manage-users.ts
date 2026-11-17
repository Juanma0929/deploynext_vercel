import { ConflictError } from "@/shared/domain/app-error";
import type { Role } from "@/shared/domain/role";

import { NewUser, type NewUserInput, type User } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";

export class ListUsers {
  constructor(private readonly repository: UserRepository) {}

  execute(): Promise<User[]> {
    return this.repository.list();
  }
}

export class GetUser {
  constructor(private readonly repository: UserRepository) {}

  execute(id: string): Promise<User> {
    return this.repository.getById(id);
  }
}

export class CreateUser {
  constructor(private readonly repository: UserRepository) {}

  async execute(input: NewUserInput): Promise<User> {
    // The entity validates before anything travels, so a short password or a
    // malformed email never becomes a request. async matters here: a method
    // that returns a Promise has to reject, not throw, or the caller would
    // need a try/catch and a .catch for the same failure.
    return this.repository.create(new NewUser(input));
  }
}

/**
 * Changes the role of a user.
 *
 * An administrator cannot demote themselves: they would lose the screen they
 * are standing on, and if they are the only administrator left, nobody could
 * promote anyone again. The API does not stop this, so the rule lives here.
 */
export class ChangeUserRole {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, role: Role, actingUserId: string): Promise<User> {
    if (id === actingUserId) {
      throw new ConflictError("No puedes cambiar tu propio rol.");
    }

    return this.repository.update(id, { role });
  }
}

/**
 * Activates or deactivates a user. Users are never deleted: deactivating is
 * what stops them from logging in while their sales keep their history.
 */
export class SetUserActive {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, isActive: boolean, actingUserId: string): Promise<User> {
    if (id === actingUserId && !isActive) {
      throw new ConflictError("No puedes desactivar tu propia cuenta.");
    }

    return this.repository.update(id, { isActive });
  }
}
