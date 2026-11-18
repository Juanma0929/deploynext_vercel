import type { User } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";

/** Gives an inactive user its access back. */
export class ReactivateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  execute(target: User): Promise<User> {
    return this.repository.update(target.id, { isActive: true });
  }
}
