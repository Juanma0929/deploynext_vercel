import { DomainError } from "@/shared/domain/errors";

import type { User } from "../domain/user";
import { PASSWORD_MIN_LENGTH, hasChanges, type UserChanges } from "../domain/user-input";
import { assertNoSelfLockout } from "../domain/user-policy";
import type { UserRepository } from "../domain/user.repository";

/**
 * Changes name, password, role or active state. `actorId` is the logged-in
 * admin, who may not deactivate itself or change its own role.
 */
export class UpdateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(actorId: string, target: User, changes: UserChanges): Promise<User> {
    assertNoSelfLockout(actorId, target, changes);

    if (changes.name !== undefined && changes.name.trim() === "") {
      throw new DomainError("El nombre es obligatorio.");
    }
    if (changes.password !== undefined && changes.password.length < PASSWORD_MIN_LENGTH) {
      throw new DomainError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
    }
    if (!hasChanges(changes)) return target;

    return this.repository.update(target.id, {
      ...changes,
      ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
    });
  }
}
