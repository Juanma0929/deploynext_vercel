import type { User } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";
import { assertNoSelfLockout } from "../domain/user-policy";

/**
 * "Deleting" a user: the API has no DELETE, so the account is deactivated
 * with isActive: false. The user cannot log in from that moment on.
 */
export class DeactivateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  execute(actorId: string, target: User): Promise<User> {
    assertNoSelfLockout(actorId, target, { isActive: false });
    return this.repository.update(target.id, { isActive: false });
  }
}
